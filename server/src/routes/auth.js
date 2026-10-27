import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect } from '../middleware/auth.js';

const router = Router();
const jwtSecret = process.env.JWT_SECRET || 'super_secret_imovies_jwt_token_key_2026_xyz';
const tokenFor = user => jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '7d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
      return res.status(400).json({ message: 'Name, email and password (at least 8 characters) are required.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 12)
      });
      return res.status(201).json({
        token: tokenFor(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // In-memory fallback
    const user = memoryStore.createUser(name, email, password);
    res.status(201).json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Registration failed.' });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password || '';

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      return res.json({
        token: tokenFor(user),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // In-memory fallback
    const user = memoryStore.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: tokenFor(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/me', protect, (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role }
  });
});

export default router;
