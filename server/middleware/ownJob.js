const Job = require('../models/Job');
const { httpError } = require('./errors');

// Ownership check: a recruiter can only touch jobs they created (prevents IDOR).
module.exports = async (req, res, next) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw httpError(404, 'Job not found');
  if (job.recruiterId !== req.user._id) throw httpError(403, 'You can only manage your own jobs');
  req.job = job;
  next();
};
