const router = require('express').Router();
const { protect, allow } = require('../middleware/auth');
const ownJob = require('../middleware/ownJob');
const jobs = require('../controllers/jobController');
const { getApplicants } = require('../controllers/applicationController');

const recruiterOnly = [protect, allow('recruiter')];

router.get('/', jobs.searchJobs);
router.get('/mine', recruiterOnly, jobs.getMyJobs);
router.get('/mine/stats', recruiterOnly, jobs.getRecruiterStats);
router.get('/:id', jobs.getJob);

router.post('/', recruiterOnly, jobs.createJob);
router.patch('/:id', recruiterOnly, ownJob, jobs.updateJob);
router.patch('/:id/close', recruiterOnly, ownJob, jobs.closeJob);
router.delete('/:id', recruiterOnly, ownJob, jobs.deleteJob);
router.get('/:id/applicants', recruiterOnly, ownJob, getApplicants);

module.exports = router;
