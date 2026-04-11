const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nurseryModel = require('../models/nurseryModel');
const userModel = require('../models/userModel');

const allowedRoles = ['customer', 'owner'];

const getJwtSecret = () => process.env.JWT_SECRET || 'dev-secret-change-me';

function signToken(user) {
  return jwt.sign(
    { role: user.role },
    getJwtSecret(),
    { subject: String(user.id), expiresIn: '7d' }
  );
}

const register = async (req, res, next) => {
  try {
    const { role, name, phone, password, nursery_name, nursery_address } =
      req.body;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        message: 'role must be one of: customer, owner'
      });
    }

    if (!name || !phone || !password) {
      return res.status(400).json({
        message: 'name, phone, and password are required'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: 'password must be at least 6 characters'
      });
    }

    if (role === 'owner' && (!nursery_name || !nursery_address)) {
      return res.status(400).json({
        message: 'nursery_name and nursery_address are required for owners'
      });
    }

    const existing = await userModel.findByPhoneWithPassword(String(phone));
    if (existing) {
      return res.status(409).json({ message: 'Phone already registered' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const user = await userModel.createUser({
      name: String(name).trim(),
      phone: String(phone).trim(),
      password_hash,
      role
    });

    let nursery = null;
    if (role === 'owner') {
      nursery = await nurseryModel.createNursery({
        owner_user_id: user.id,
        name: String(nursery_name).trim(),
        address: String(nursery_address).trim()
      });
    }

    const token = signToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
      nursery
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'phone and password are required' });
    }

    const userWithPassword = await userModel.findByPhoneWithPassword(
      String(phone).trim()
    );

    if (!userWithPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(
      String(password),
      userWithPassword.password_hash
    );

    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      phone: userWithPassword.phone,
      role: userWithPassword.role,
      created_at: userWithPassword.created_at
    };

    const token = signToken(user);

    let nursery = null;
    if (user.role === 'owner') {
      nursery = await nurseryModel.getNurseryByOwnerUserId(user.id);
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user,
      nursery
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  login,
  me
};

