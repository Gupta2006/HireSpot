const router = require('express').Router();
const { protect, allow } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadResume, uploadProfilePicture, removeResume, removeProfilePicture, downloadResume } = require('../controllers/fileController');

// Mounted at /api, so these become POST /api/uploads/resume and GET /api/files/:id
router.post('/uploads/resume', protect, allow('candidate'), upload.resume, uploadResume);
router.post('/uploads/profile-picture', protect, allow('candidate', 'recruiter', 'admin'), upload.profilePicture, uploadProfilePicture);
router.delete('/uploads/profile-picture', protect, allow('candidate', 'recruiter', 'admin'), removeProfilePicture);
router.delete('/files/:id', protect, allow('candidate'), removeResume);
router.get('/files/:id', protect, downloadResume);

module.exports = router;
