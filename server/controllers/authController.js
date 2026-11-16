const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { emitCandidateRegistered } = require('../events/hireSpotEvents');
const { httpError } = require('../middleware/errors');

const isText = (value) => typeof value === 'string' && value.trim() !== '';

const sendToken = async (res, user, status = 200) => {
  const profile = await Profile.findOne({ userId: user._id });
  return res.status(status).json({
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      profilePicture: profile?.profilePicture || user.profilePicture || '',
    },
  });
};

exports.register = async (req, res) => {
  const { name, email, password, role, company } = req.body || {};
  if (![name, email, password, role].every(isText)) throw httpError(400, 'Please fill in all fields');
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw httpError(400, 'Please enter a valid email');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (!['candidate', 'recruiter'].includes(role)) throw httpError(400, 'Role must be candidate or recruiter');
  if (role === 'recruiter' && !isText(company)) throw httpError(400, 'Company name is required for recruiters');

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw httpError(409, 'An account with this email already exists.');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    role,
    company: role === 'recruiter' ? company.trim() : '',
    passwordHash,
    active: true,
  });

  if (role === 'candidate') {
    await Profile.create({
      userId: user._id,
      headline: '',
      skills: [],
      experienceYears: 0,
      education: [],
      experience: [],
      resumes: [],
      savedJobs: [],
    });
    emitCandidateRegistered({ userId: user._id, email: user.email, name: user.name });
  }

  res.status(201).json({
    message: 'Registration successful',
    user: { id: user._id, name: user.name, email: user.email, role: user.role, company: user.company },
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!isText(email) || !isText(password)) throw httpError(400, 'Email and password are required');
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw httpError(401, 'Invalid email or password');
  if (!user.active) throw httpError(403, 'Your account has been blocked');
  await sendToken(res, user);
};
