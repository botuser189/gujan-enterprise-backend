const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(admin._id);
  res.json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token
  });
});

router.get('/me', protect, async (req, res) => {
  res.json(req.admin);
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(400).json({ message: 'Admin already exists' });
  const admin = await Admin.create({ name, email, password, role: 'admin' });
  const token = generateToken(admin._id);
  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token
  });
});

module.exports = router;
