const Profile = require('../models/Profile');
const Job = require('../models/Job');
const User = require('../models/User');
const { httpError } = require('../middleware/errors');

const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ userId });
  if (!profile) {
    profile = await Profile.create({
      userId,
      headline: '',
      skills: [],
      experienceYears: 0,
      expectedCtc: '',
      education: [],
      experience: [],
      resumes: [],
      savedJobs: [],
    });
  }
  return profile;
};

const text = (v) => (typeof v === 'string' ? v.trim() : '');
const cleanRows = (list, keys) =>
  (Array.isArray(list) ? list : [])
    .map((row) => Object.fromEntries(keys.map((key) => [key, text(row?.[key])])))
    .filter((row) => row[keys[0]] && row[keys[1]]);

const completion = (p) =>
  [p.headline, p.skills?.length, p.education?.length, p.experience?.length, p.resumes?.length].filter(Boolean).length * 20;

exports.getMyProfile = async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  res.json({ profile, name: req.user.name, email: req.user.email, completion: completion(profile) });
};

exports.getRecruiterProfile = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.user._id });
  res.json({
    name: req.user.name,
    email: req.user.email,
    company: req.user.company || '',
    profilePicture: profile?.profilePicture || '',
  });
};

exports.updateRecruiterProfile = async (req, res) => {
  const name = text(req.body?.name);
  const company = text(req.body?.company);
  if (!name || !company) throw httpError(400, 'Name and company are required');

  await User.findByIdAndUpdate(req.user._id, { name, company });
  req.user.name = name;
  req.user.company = company;
  res.json({ message: 'Company profile saved', name, company });
};

exports.updateMyProfile = async (req, res) => {
  const { name, headline, skills, experienceYears, expectedCtc, education, experience } = req.body || {};
  if (!text(name)) throw httpError(400, 'Name is required');
  if (!Array.isArray(skills)) throw httpError(400, 'Skills must be a list');

  const years = experienceYears === '' || experienceYears == null ? 0 : Number(experienceYears);
  if (!Number.isFinite(years) || years < 0 || years > 50) throw httpError(400, 'Experience must be between 0 and 50 years');

  const ctc = expectedCtc === '' || expectedCtc == null ? '' : Number(expectedCtc);
  if (ctc !== '' && (!Number.isFinite(ctc) || ctc < 0)) throw httpError(400, 'Expected CTC must be a valid non-negative number');

  const profile = await getOrCreateProfile(req.user._id);
  profile.headline = text(headline);
  profile.skills = skills.map(text).filter(Boolean);
  profile.experienceYears = years;
  profile.expectedCtc = ctc;
  profile.education = cleanRows(education, ['degree', 'institution', 'year']);
  profile.experience = cleanRows(experience, ['company', 'position', 'duration']);
  await profile.save();

  await User.findByIdAndUpdate(req.user._id, { name: text(name) });
  req.user.name = text(name);

  res.json({ message: 'Profile saved', completion: completion(profile) });
};

exports.getSavedJobs = async (req, res) => {
  const profile = await getOrCreateProfile(req.user._id);
  const jobs = await Job.find({ _id: { $in: profile.savedJobs || [] }, status: 'approved' }).lean();
  res.json(jobs);
};

exports.saveJob = async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, status: 'approved' });
  if (!job) throw httpError(404, 'Job not found');

  await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $addToSet: { savedJobs: req.params.jobId } },
    { upsert: true }
  );
  res.json({ message: 'Job saved' });
};

exports.unsaveJob = async (req, res) => {
  await Profile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { savedJobs: req.params.jobId } }
  );
  res.json({ message: 'Job removed from saved jobs' });
};
