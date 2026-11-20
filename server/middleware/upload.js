const multer = require('multer');
const path = require('path');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const resumeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const imageTypes = ['image/jpeg', 'image/png'];
const validExtension = (file, extensions) => extensions.includes(path.extname(file.originalname).toLowerCase());
exports.resume = (req, res, next) => upload.single('resume')(req, res, err => {
  if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'File must be 2 MB or smaller' : err.message });
  if (!req.file || !resumeTypes.includes(req.file.mimetype) || !validExtension(req.file, ['.pdf', '.doc', '.docx'])) return res.status(400).json({ message: 'Only PDF, DOC, or DOCX files are allowed.' });
  next();
});
exports.profilePicture = (req, res, next) => upload.single('profilePicture')(req, res, err => {
  if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller' : err.message });
  if (!req.file || !imageTypes.includes(req.file.mimetype) || !validExtension(req.file, ['.jpg', '.jpeg', '.png'])) return res.status(400).json({ message: 'Only JPG, JPEG, and PNG images are allowed.' });
  next();
});
