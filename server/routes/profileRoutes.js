const router = require('express').Router();
const { protect, allow } = require('../middleware/auth');
const profile = require('../controllers/profileController');

router.use(protect);
router.get('/me', allow('candidate'), profile.getMyProfile);
router.put('/me', allow('candidate'), profile.updateMyProfile);
router.get('/recruiter/me', allow('recruiter'), profile.getRecruiterProfile);
router.put('/recruiter/me', allow('recruiter'), profile.updateRecruiterProfile);
router.use(allow('candidate'));
router.get('/saved', profile.getSavedJobs);
router.post('/saved/:jobId', profile.saveJob);
router.delete('/saved/:jobId', profile.unsaveJob);

module.exports = router;
