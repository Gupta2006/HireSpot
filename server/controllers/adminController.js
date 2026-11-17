const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');
const { httpError } = require('../middleware/errors');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company || '',
  active: user.active !== false,
  createdAt: user.createdAt,
});

exports.dashboard = async (_req, res) => {
  const [users, jobs, applications] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    Job.find().sort({ createdAt: -1 }).lean(),
    Application.find().lean(),
  ]);

  const userMap = Object.fromEntries(users.map((u) => [u._id, publicUser(u)]));
  const stageCounts = applications.reduce((acc, a) => {
    acc[a.stage] = (acc[a.stage] || 0) + 1;
    return acc;
  }, {});

  res.json({
    users: {
      total: users.length,
      candidates: users.filter((u) => u.role === 'candidate').length,
      recruiters: users.filter((u) => u.role === 'recruiter').length,
      admins: users.filter((u) => u.role === 'admin').length,
    },
    jobs: {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      approved: jobs.filter((j) => j.status === 'approved').length,
      closed: jobs.filter((j) => j.status === 'closed').length,
      rejected: jobs.filter((j) => j.status === 'rejected').length,
    },
    applications: {
      total: applications.length,
      ...stageCounts,
    },
    recentUsers: users.slice(0, 5).map(publicUser),
    recentJobs: jobs.slice(0, 5).map((j) => ({
      ...j,
      recruiter: userMap[j.recruiterId] || null,
    })),
  });
};

exports.listUsers = async (req, res) => {
  const search = String(req.query.search || '').trim();
  const role = req.query.role;
  if (role && !['candidate', 'recruiter', 'admin'].includes(role)) throw httpError(400, 'Invalid role filter');

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).lean();
  res.json(users.map(publicUser));
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw httpError(404, 'User not found');
  const profile = await Profile.findOne({ userId: user._id }).lean();
  res.json({ ...publicUser(user), profile: profile || null });
};

exports.getOwnProfile = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id }).lean();
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profilePicture: profile?.profilePicture || req.user.profilePicture || '',
  });
};

exports.updateOwnProfile = async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name || name.length > 100) throw httpError(400, 'Name must be between 1 and 100 characters');

  await User.findByIdAndUpdate(req.user._id, { name });
  req.user.name = name;

  const profile = await Profile.findOne({ userId: req.user._id }).lean();
  res.json({
    message: 'Admin profile saved',
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    profilePicture: profile?.profilePicture || req.user.profilePicture || '',
  });
};

exports.setUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'User not found');
  if (user._id === req.user._id) throw httpError(400, 'You cannot change your own account status');
  if (user.role === 'admin') throw httpError(400, 'Admin account status cannot be changed here');
  if (typeof req.body?.active !== 'boolean') throw httpError(400, 'Active must be true or false');

  user.active = req.body.active;
  await user.save();
  res.json({ user: publicUser(user) });
};

exports.listJobs = async (req, res) => {
  const search = String(req.query.search || '').trim();
  const status = req.query.status;
  if (status && !['pending', 'approved', 'closed', 'rejected'].includes(status)) throw httpError(400, 'Invalid status filter');

  const query = {};
  if (status) query.status = status;

  const [jobs, recruiters, applications] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).lean(),
    User.find({ role: 'recruiter' }).lean(),
    Application.find().select('jobId').lean(),
  ]);

  const recruiterMap = Object.fromEntries(recruiters.map((u) => [u._id, publicUser(u)]));
  const appCountMap = applications.reduce((acc, a) => {
    acc[a.jobId] = (acc[a.jobId] || 0) + 1;
    return acc;
  }, {});

  let result = jobs.map((j) => ({
    ...j,
    applications: appCountMap[j._id] || 0,
    recruiter: recruiterMap[j.recruiterId] || null,
  }));

  if (search) {
    const s = search.toLowerCase();
    result = result.filter(
      (j) =>
        j.title?.toLowerCase().includes(s) ||
        j.company?.toLowerCase().includes(s) ||
        j.recruiter?.name?.toLowerCase().includes(s) ||
        j.recruiter?.email?.toLowerCase().includes(s)
    );
  }

  res.json(result);
};

exports.approveJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw httpError(404, 'Job not found');
  if (!['pending', 'rejected'].includes(job.status)) throw httpError(409, 'Only pending or rejected jobs can be approved');

  job.status = 'approved';
  job.rejectionReason = '';
  job.reviewedAt = new Date();
  await job.save();
  res.json({ job });
};

exports.rejectJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw httpError(404, 'Job not found');
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';
  if (!reason) throw httpError(400, 'A rejection reason is required');
  if (job.status !== 'pending') throw httpError(409, 'Only pending jobs can be rejected');

  job.status = 'rejected';
  job.rejectionReason = reason;
  job.reviewedAt = new Date();
  await job.save();
  res.json({ job });
};

exports.closeJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw httpError(404, 'Job not found');
  if (!['approved', 'pending'].includes(job.status)) throw httpError(409, 'This job cannot be closed');

  job.status = 'closed';
  job.closedAt = new Date();
  await job.save();
  res.json({ job });
};

exports.analytics = async (_req, res) => {
  const [users, jobs, applications] = await Promise.all([
    User.find().lean(),
    Job.find().lean(),
    Application.find().lean(),
  ]);

  const counts = (items, key) =>
    items.reduce((result, item) => {
      const value = item[key] || 'unknown';
      result[value] = (result[value] || 0) + 1;
      return result;
    }, {});

  const monthlyCounts = new Map();
  for (const user of users) {
    if (user.role !== 'candidate' && user.role !== 'recruiter') continue;
    const timestamp = new Date(user.createdAt);
    if (Number.isNaN(timestamp.getTime())) continue;
    const month = timestamp.toISOString().slice(0, 7);
    monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1);
  }
  const registrationsByMonth = [...monthlyCounts.entries()].sort(([a], [b]) => a.localeCompare(b));

  const jobMap = Object.fromEntries(jobs.map((j) => [j._id, j.title]));
  const activity = [
    ...applications.map((a) => ({
      type: 'application',
      date: a.createdAt,
      label: `Application moved to ${a.stage}`,
      detail: jobMap[a.jobId] || 'Job removed',
    })),
    ...jobs.map((j) => ({
      type: 'job',
      date: j.createdAt,
      label: `Job ${j.status}`,
      detail: j.title,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  res.json({
    userRoles: counts(users, 'role'),
    jobsByStatus: counts(jobs, 'status'),
    applicationsByStage: counts(applications, 'stage'),
    registrationsByMonth,
    activity,
  });
};
