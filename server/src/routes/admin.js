import { Router } from 'express';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect, adminOnly);

router.get('/metrics', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [
        moviesCount,
        theatresCount,
        upcomingShowsCount,
        totalUsersCount,
        bookingsCount,
        recentBookings,
        revenueResult
      ] = await Promise.all([
        Movie.countDocuments({ active: true }),
        Theatre.countDocuments(),
        Show.countDocuments({ active: true, startsAt: { $gte: new Date() } }),
        User.countDocuments(),
        Booking.countDocuments(),
        Booking.find()
          .populate('user', 'name email')
          .populate('movie', 'title')
          .populate({ path: 'show', populate: 'theatre' })
          .sort({ createdAt: -1 })
          .limit(10),
        Booking.aggregate([
          { $match: { status: 'confirmed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      const totalRevenue = revenueResult[0]?.total || 0;

      return res.json({
        metrics: {
          moviesCount,
          theatresCount,
          upcomingShowsCount,
          totalUsersCount,
          bookingsCount,
          totalRevenue
        },
        recentBookings
      });
    }

    // In-memory fallback
    const movies = memoryStore.getMovies();
    const theatres = memoryStore.getTheatres();
    const shows = memoryStore.getShows();
    const bookings = memoryStore.getAllBookings();
    const totalRevenue = bookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.totalAmount : sum, 0);

    res.json({
      metrics: {
        moviesCount: movies.length,
        theatresCount: theatres.length,
        upcomingShowsCount: shows.length,
        totalUsersCount: memoryStore.users.length,
        bookingsCount: bookings.length,
        totalRevenue
      },
      recentBookings: bookings.slice(0, 10)
    });
  } catch (e) {
    next(e);
  }
});

export default router;
