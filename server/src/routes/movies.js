import { Router } from 'express';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET all movies
router.get('/', async (req, res, next) => {
  try {
    const { search = '', genre, language } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { active: true };
      if (search.trim()) filter.$text = { $search: search.trim() };
      if (genre && genre !== 'All') filter.genre = genre;
      if (language && language !== 'All') filter.language = language;

      const movies = await Movie.find(filter).sort({ createdAt: -1 });
      return res.json({ movies });
    }

    // In-memory fallback
    const movies = memoryStore.getMovies(search, genre, language);
    res.json({ movies });
  } catch (e) {
    next(e);
  }
});

// GET movie by ID
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.findOne({ _id: req.params.id, active: true });
      if (!movie) return res.status(404).json({ message: 'Movie not found.' });
      return res.json({ movie });
    }

    const movie = memoryStore.getMovieById(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json({ movie });
  } catch (e) {
    next(e);
  }
});

// POST create movie (admin)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.create(req.body);
      return res.status(201).json({ movie });
    }

    const movie = memoryStore.createMovie(req.body);
    res.status(201).json({ movie });
  } catch (e) {
    next(e);
  }
});

// DELETE deactivate movie (admin)
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const movie = await Movie.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
      if (!movie) return res.status(404).json({ message: 'Movie not found.' });
      return res.json({ message: 'Movie deactivated.' });
    }

    const movie = memoryStore.deactivateMovie(req.params.id);
    if (!movie) return res.status(404).json({ message: 'Movie not found.' });
    res.json({ message: 'Movie deactivated.' });
  } catch (e) {
    next(e);
  }
});

export default router;
