const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { httpError } = require('./errors');

// Checks the JWT and attaches the logged-in user to req.user
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Please log in first');

  let id;
  try {
    ({ id } = jwt.verify(token, process.env.JWT_SECRET));
  } catch {
    throw httpError(401, 'Session expired, please log in again');
  }
  const user = await User.findById(id);
  if (!user || !user.active) throw httpError(401, 'Account not available');
  req.user = user;
  next();
};

// Role-based access: allow('recruiter') lets only recruiters through
exports.allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) throw httpError(403, 'You do not have access to this resource');
  next();
};
