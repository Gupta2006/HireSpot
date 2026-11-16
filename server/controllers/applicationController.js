const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const { emitApplicationSubmitted } = require('../events/hireSpotEvents');
const { httpError } = require('../middleware/errors');

const NEXT = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview', 'rejected'],
  interview: ['offered', 'rejected'],
  offered: [],
  rejected: [],
};

exports.apply = async (req, res) => {
  const { jobId, resumeId, coverNote } = req.body || {};
  if (typeof jobId !== 'string' || typeof resumeId !== 'string') throw httpError(400, 'Job and resume are required');

  const job = await Job.findOne({ _id: jobId, status: 'approved', deadline: { $gte: new Date() } });
  if (!job) throw httpError(404, 'This job is no longer open');

  const profile = await Profile.findOne({ userId: req.user._id });
  if (!profile?.resumes.some((r) => r._id === resumeId)) throw httpError(400, 'Please select one of your uploaded resumes');

  const existing = await Application.findOne({ jobId, candidateId: req.user._id });
  if (existing) throw httpError(409, 'You have already applied for this job');

  const application = await Application.create({
    jobId,
    candidateId: req.user._id,
    resumeId,
    resumeUrl: `/api/files/${resumeId}`,
    coverNote: typeof coverNote === 'string' ? coverNote.trim().slice(0, 1000) : '',
    stage: 'applied',
    stageHistory: [{ stage: 'applied', createdAt: new Date() }],
    recruiterNotes: [],
  });

  emitApplicationSubmitted({ applicationId: application._id, candidateId: req.user._id, jobId, stage: application.stage });
  res.status(201).json({ message: 'Application submitted', application });
};

exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ candidateId: req.user._id }).sort({ createdAt: -1 }).populate('jobId').lean();
  res.json(apps.filter((a) => a.jobId));
};

exports.getApplicants = async (req, res) => {
  const apps = await Application.find({ jobId: req.job._id })
    .sort({ createdAt: -1 })
    .populate('candidateId', '_id name email')
    .lean();

  const candidateIds = apps.map((a) => (a.candidateId?._id ? a.candidateId._id : a.candidateId)).filter(Boolean);
  const profiles = await Profile.find({ userId: { $in: candidateIds } }).lean();
  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

  res.json({
    job: { _id: req.job._id, title: req.job.title },
    applicants: apps.map((a) => {
      const candId = a.candidateId?._id ? a.candidateId._id : a.candidateId;
      return {
        ...a,
        profile: profileMap[candId] || null,
      };
    }),
  });
};

const owned = async (req) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw httpError(404, 'Application not found');
  const job = await Job.findById(app.jobId);
  if (!job || job.recruiterId !== req.user._id) throw httpError(403, 'You can only manage applicants of your own jobs');
  return app;
};

exports.updateStage = async (req, res) => {
  const app = await owned(req);
  const stage = req.body?.stage;
  if (!NEXT[app.stage]?.includes(stage)) throw httpError(400, `Cannot move an application from ${app.stage} to ${stage}`);
  app.stage = stage;
  app.stageHistory.push({ stage, createdAt: new Date() });
  await app.save();
  res.json({ message: 'Stage updated', stage });
};

exports.addNote = async (req, res) => {
  const app = await owned(req);
  const noteText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  if (!noteText || noteText.length > 500) throw httpError(400, 'Note must be 1 to 500 characters');
  app.recruiterNotes.push({ text: noteText, createdAt: new Date() });
  await app.save();
  res.status(201).json({ message: 'Note added', recruiterNotes: app.recruiterNotes });
};
