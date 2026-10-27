import { Router } from 'express';
import mongoose from 'mongoose';
import Show from '../models/Show.js';
import Theatre from '../models/Theatre.js';
import Movie from '../models/Movie.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

// GET shows with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { movieId, theatreId, date, all } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = { active: true };
      if (all !== 'true') filter.startsAt = { $gte: new Date() };
      if (movieId) filter.movie = movieId;
      if (theatreId) filter.theatre = theatreId;

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        filter.startsAt = { $gte: startOfDay, $lte: endOfDay };
      }

      const shows = await Show.find(filter)
        .populate('movie')
        .populate('theatre')
        .sort({ startsAt: 1 })
        .limit(150);

      return res.json({ shows });
    }

    // In-memory fallback
    const shows = memoryStore.getShows({ movieId, theatreId, date, all });
    res.json({ shows });
  } catch (e) {
    next(e);
  }
});

// GET single show by ID
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const show = await Show.findById(req.params.id)
        .populate('movie')
        .populate('theatre');

      if (!show) {
        return res.status(404).json({ message: 'Show not found or no longer available.' });
      }
      return res.json({ show });
    }

    const show = memoryStore.getShowById(req.params.id);
    if (!show) {
      return res.status(404).json({ message: 'Show not found or no longer available.' });
    }
    res.json({ show });
  } catch (e) {
    next(e);
  }
});

// POST create show (admin only)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { movie, theatre, startsAt, price, rows = 6, seatsPerRow = 10 } = req.body;
    if (!movie || !theatre || !startsAt || price == null) {
      return res.status(400).json({ message: 'Movie, theatre, startsAt, and price are required.' });
    }

    if (mongoose.connection.readyState === 1) {
      const [theatreExists, movieExists] = await Promise.all([
        Theatre.findById(theatre),
        Movie.findById(movie)
      ]);

      if (!theatreExists) return res.status(400).json({ message: 'Selected theatre does not exist.' });
      if (!movieExists) return res.status(400).json({ message: 'Selected movie does not exist.' });

      const totalRows = Math.min(12, Math.max(1, Number(rows)));
      const totalCols = Math.min(20, Math.max(1, Number(seatsPerRow)));
      const seats = [];

      for (let r = 0; r < totalRows; r++) {
        const rowLetter = String.fromCharCode(65 + r);
        for (let c = 1; c <= totalCols; c++) {
          seats.push({
            seatNumber: `${rowLetter}${c}`,
            status: 'available'
          });
        }
      }

      const show = await Show.create({
        movie,
        theatre,
        startsAt: new Date(startsAt),
        price: Number(price),
        seats
      });

      const populatedShow = await Show.findById(show._id).populate('movie').populate('theatre');
      return res.status(201).json({ show: populatedShow });
    }

    // In-memory fallback
    const show = memoryStore.createShow({ movie, theatre, startsAt, price, rows, seatsPerRow });
    res.status(201).json({ show });
  } catch (e) {
    next(e);
  }
});

// DELETE show
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const show = await Show.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
      if (!show) return res.status(404).json({ message: 'Show not found.' });
      return res.json({ message: 'Show deactivated successfully.' });
    }

    const show = memoryStore.deactivateShow(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found.' });
    res.json({ message: 'Show deactivated successfully.' });
  } catch (e) {
    next(e);
  }
});

export default router;
