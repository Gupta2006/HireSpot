const router = require('express').Router();
const { protect, allow } = require('../middleware/auth');
const applications = require('../controllers/applicationController');

router.post('/', protect, allow('candidate'), applications.apply);
router.get('/me', protect, allow('candidate'), applications.getMyApplications);
router.patch('/:id/stage', protect, allow('recruiter'), applications.updateStage);
router.post('/:id/notes', protect, allow('recruiter'), applications.addNote);

module.exports = router;
