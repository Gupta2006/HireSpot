const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { register, login } = require('../controllers/authController');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['candidate', 'recruiter']).withMessage('Role must be candidate or recruiter'),
  body('company').if((_value, { req }) => req.body?.role === 'recruiter').trim().notEmpty().withMessage('Company name is required for recruiters'),
], validate, register);
router.post('/login', [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Email and password are required'),
], validate, login);

module.exports = router;
