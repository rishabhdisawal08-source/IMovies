import { Router } from 'express';
import mongoose from 'mongoose';
import Theatre from '../models/Theatre.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET all theatres
router.get('/', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const { location } = req.query;
      const filter = {};
      if (location) filter.location = new RegExp(location, 'i');
      const theatres = await Theatre.find(filter).sort({ name: 1 });
      return res.json({ theatres });
    }

    const theatres = memoryStore.getTheatres();
    res.json({ theatres });
  } catch (e) {
    next(e);
  }
});

// GET single theatre
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const theatre = await Theatre.findById(req.params.id);
      if (!theatre) return res.status(404).json({ message: 'Theatre not found.' });
      return res.json({ theatre });
    }

    const theatre = memoryStore.getTheatreById(req.params.id);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found.' });
    res.json({ theatre });
  } catch (e) {
    next(e);
  }
});

// POST create theatre
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, location, screens = 1 } = req.body;
    if (!name?.trim() || !location?.trim()) {
      return res.status(400).json({ message: 'Theatre name and location are required.' });
    }

    if (mongoose.connection.readyState === 1) {
      const theatre = await Theatre.create({
        name: name.trim(),
        location: location.trim(),
        screens: Number(screens) || 1
      });
      return res.status(201).json({ theatre });
    }

    const theatre = memoryStore.createTheatre({
      name: name.trim(),
      location: location.trim(),
      screens: Number(screens) || 1
    });
    res.status(201).json({ theatre });
  } catch (e) {
    next(e);
  }
});

// DELETE theatre
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const theatre = await Theatre.findByIdAndDelete(req.params.id);
      if (!theatre) return res.status(404).json({ message: 'Theatre not found.' });
      return res.json({ message: 'Theatre deleted successfully.' });
    }

    const deleted = memoryStore.deleteTheatre(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Theatre not found.' });
    res.json({ message: 'Theatre deleted successfully.' });
  } catch (e) {
    next(e);
  }
});

export default router;
