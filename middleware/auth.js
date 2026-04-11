const jwt = require('jsonwebtoken');

const userModel = require('../models/userModel');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const [, token] = authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ message: 'Missing Authorization token' });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
};

module.exports = {
  requireAuth,
  requireRole
};

