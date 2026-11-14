const Job = require('../models/Job');
const Application = require('../models/Application');
const { emitJobCreated } = require('../events/hireSpotEvents');
const { httpError } = require('../middleware/errors');

const text = (v) => (typeof v === 'string' ? v.trim() : '');

const parseJob = (input, user) => {
  const body = input || {};
  const data = {
    title: text(body.title),
    description: text(body.description),
    location: text(body.location),
    workMode: body.workMode,
    skills: (Array.isArray(body.skills) ? body.skills : []).map(text).filter(Boolean),
    minExp: body.minExp === '' || body.minExp == null ? 0 : Number(body.minExp),
    ctcRange: { min: Number(body.ctcRange?.min), max: Number(body.ctcRange?.max) },
    deadline: new Date(body.deadline),
  };
  if (!data.title || !data.description || !data.location) throw httpError(400, 'Title, description and location are required');
  if (!['onsite', 'hybrid', 'remote'].includes(data.workMode)) throw httpError(400, 'Please choose a work mode');
  if (
    !Number.isFinite(data.minExp) ||
    data.minExp < 0 ||
    !Number.isFinite(data.ctcRange.min) ||
    !Number.isFinite(data.ctcRange.max) ||
    data.ctcRange.min < 0 ||
    data.ctcRange.max < data.ctcRange.min
  )
    throw httpError(400, 'Enter valid experience and CTC values');
  if (isNaN(data.deadline) || data.deadline < new Date()) throw httpError(400, 'Deadline must be a future date');
  return { ...data, company: user.company };
};

exports.searchJobs = async (req, res) => {
  const { role, location, minExp, ctc, workMode, skills } = req.query;
  const requestedPage = req.query.page === undefined ? 1 : Number(req.query.page);
  if (!Number.isInteger(requestedPage) || requestedPage < 1) throw httpError(400, 'Page must be a positive whole number');
  if (workMode && !['onsite', 'hybrid', 'remote'].includes(workMode)) throw httpError(400, 'Work mode must be onsite, hybrid, or remote');

  const query = {
    status: 'approved',
    deadline: { $gte: new Date() },
  };

  if (role) {
    query.title = { $regex: String(role).trim(), $options: 'i' };
  }
  if (location) {
    query.location = { $regex: String(location).trim(), $options: 'i' };
  }
  if (minExp !== undefined && minExp !== '') {
    const experience = Number(minExp);
    if (!Number.isFinite(experience) || experience < 0) throw httpError(400, 'Experience filter must be a valid non-negative number');
    query.minExp = { $lte: experience };
  }
  if (ctc !== undefined && ctc !== '') {
    const minimumCtc = Number(ctc);
    if (!Number.isFinite(minimumCtc) || minimumCtc < 0) throw httpError(400, 'CTC filter must be a valid non-negative number');
    query['ctcRange.max'] = { $gte: minimumCtc };
  }
  if (workMode) {
    query.workMode = workMode;
  }
  if (skills) {
    const wanted = String(skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (wanted.length) {
      query.skills = { $in: wanted.map((s) => new RegExp(s, 'i')) };
    }
  }

  const page = requestedPage;
  const limit = 9;
  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Job.countDocuments(query),
  ]);

  res.json({
    jobs,
    total,
    pages: Math.ceil(total / limit),
  });
};

exports.getJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, status: 'approved' }).lean();
  if (!job) throw httpError(404, 'Job not found');
  res.json(job);
};

exports.createJob = async (req, res) => {
  const jobData = {
    ...parseJob(req.body, req.user),
    recruiterId: req.user._id,
    status: 'pending',
  };
  const job = await Job.create(jobData);
  emitJobCreated({ jobId: job._id, recruiterId: req.user._id, title: job.title, company: job.company });
  res.status(201).json({ message: 'Job submitted for admin approval', job });
};

exports.updateJob = async (req, res) => {
  Object.assign(req.job, parseJob(req.body, req.user), { status: 'pending', rejectionReason: '' });
  await req.job.save();
  res.json({ message: 'Job updated and submitted for admin approval', job: req.job });
};

exports.closeJob = async (req, res) => {
  req.job.status = 'closed';
  await req.job.save();
  res.json({ message: 'Job closed', job: req.job });
};

exports.deleteJob = async (req, res) => {
  await Application.deleteMany({ jobId: req.job._id });
  await req.job.deleteOne();
  res.json({ message: 'Job deleted' });
};

exports.getMyJobs = async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).lean();
  const jobIds = jobs.map((j) => j._id);
  const appCounts = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: '$jobId', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(appCounts.map((c) => [c._id, c.count]));
  res.json(jobs.map((j) => ({ ...j, applicants: countMap[j._id] || 0 })));
};

exports.getRecruiterStats = async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.user._id }).select('_id status').lean();
  const jobIds = jobs.map((j) => j._id);
  const activeJobs = jobs.filter((j) => j.status === 'approved').length;

  const [totalApps, shortlisted, interviews] = await Promise.all([
    Application.countDocuments({ jobId: { $in: jobIds } }),
    Application.countDocuments({ jobId: { $in: jobIds }, stage: 'shortlisted' }),
    Application.countDocuments({ jobId: { $in: jobIds }, stage: 'interview' }),
  ]);

  res.json({
    activeJobs,
    applications: totalApps,
    shortlisted,
    interviews,
  });
};
