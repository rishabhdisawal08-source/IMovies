import { Router } from 'express';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import { memoryStore } from '../store/memoryStore.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// POST book seats
router.post('/', async (req, res, next) => {
  try {
    const { showId, seatNumbers } = req.body;
    if (!showId || !Array.isArray(seatNumbers) || !seatNumbers.length || seatNumbers.length > 10) {
      return res.status(400).json({ message: 'Choose between 1 and 10 seats.' });
    }

    const uniqueSeats = [...new Set(seatNumbers.map(String))];
    if (uniqueSeats.length !== seatNumbers.length) {
      return res.status(400).json({ message: 'Duplicate seats selected.' });
    }

    if (mongoose.connection.readyState === 1) {
      // Atomic conditional update in MongoDB
      const show = await Show.findOneAndUpdate(
        {
          _id: showId,
          active: true,
          startsAt: { $gt: new Date() },
          seats: { $all: uniqueSeats.map(seatNumber => ({ $elemMatch: { seatNumber, status: 'available' } })) }
        },
        {
          $set: Object.fromEntries(uniqueSeats.map((s, i) => [`seats.$[seat${i}].status`, 'booked']))
        },
        {
          new: true,
          arrayFilters: uniqueSeats.map((s, i) => ({ [`seat${i}.seatNumber`]: s, [`seat${i}.status`]: 'available' }))
        }
      );

      if (!show) {
        return res.status(409).json({ message: 'One or more selected seats were just taken. Please pick other seats.' });
      }

      try {
        const booking = await Booking.create({
          user: req.user._id,
          show: show._id,
          movie: show.movie,
          seatNumbers: uniqueSeats,
          totalAmount: show.price * uniqueSeats.length,
          bookingCode: `IM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          paymentStatus: 'demo'
        });

        const populated = await Booking.findById(booking._id)
          .populate('movie')
          .populate({ path: 'show', populate: 'theatre' });

        req.app.get('io')?.to(show._id.toString()).emit('seats-updated', {
          showId: show._id.toString(),
          seats: show.seats
        });

        return res.status(201).json({
          booking: populated,
          message: 'Booking confirmed! Digital ticket generated.'
        });
      } catch (e) {
        await Show.updateOne(
          { _id: show._id },
          { $set: Object.fromEntries(uniqueSeats.map((s, i) => [`seats.$[seat${i}].status`, 'available'])) },
          { arrayFilters: uniqueSeats.map((s, i) => ({ [`seat${i}.seatNumber`]: s, [`seat${i}.status`]: 'booked' })) }
        );
        throw e;
      }
    }

    // In-memory atomic booking fallback
    try {
      const { booking, updatedShow } = memoryStore.bookSeats(req.user._id, showId, uniqueSeats);

      req.app.get('io')?.to(showId.toString()).emit('seats-updated', {
        showId: showId.toString(),
        seats: updatedShow.seats
      });

      return res.status(201).json({
        booking,
        message: 'Booking confirmed! Digital ticket generated.'
      });
    } catch (memErr) {
      return res.status(409).json({ message: memErr.message });
    }
  } catch (e) {
    next(e);
  }
});

// GET user's bookings
router.get('/my', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('movie')
        .populate({ path: 'show', populate: 'theatre' })
        .sort({ createdAt: -1 });

      return res.json({ bookings });
    }

    const bookings = memoryStore.getBookingsByUser(req.user._id);
    res.json({ bookings });
  } catch (e) {
    next(e);
  }
});

// GET all bookings (Admin only)
router.get('/admin/all', adminOnly, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find()
        .populate('user', 'name email')
        .populate('movie', 'title')
        .populate({ path: 'show', populate: 'theatre' })
        .sort({ createdAt: -1 })
        .limit(100);

      const totalRevenue = await Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      return res.json({
        bookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        count: bookings.length
      });
    }

    const bookings = memoryStore.getAllBookings();
    const totalRevenue = bookings.reduce((sum, b) => b.status === 'confirmed' ? sum + b.totalAmount : sum, 0);
    res.json({ bookings, totalRevenue, count: bookings.length });
  } catch (e) {
    next(e);
  }
});

// GET single booking by ID
router.get('/:id', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const query = { _id: req.params.id };
      if (req.user.role !== 'admin') query.user = req.user._id;

      const booking = await Booking.findOne(query)
        .populate('movie')
        .populate({ path: 'show', populate: 'theatre' });

      if (!booking) return res.status(404).json({ message: 'Booking not found.' });
      return res.json({ booking });
    }

    const booking = memoryStore.getAllBookings().find(b => b._id.toString() === req.params.id.toString());
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ booking });
  } catch (e) {
    next(e);
  }
});

// PATCH cancel booking
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
      if (!booking) return res.status(404).json({ message: 'Booking not found.' });
      if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is already cancelled.' });

      const show = await Show.findById(booking.show);
      if (show && show.startsAt > new Date()) {
        await Show.updateOne(
          { _id: show._id },
          { $set: Object.fromEntries(booking.seatNumbers.map((s, i) => [`seats.$[seat${i}].status`, 'available'])) },
          { arrayFilters: booking.seatNumbers.map((s, i) => ({ [`seat${i}.seatNumber`]: s, [`seat${i}.status`]: 'booked' })) }
        );

        const updated = await Show.findById(show._id);
        req.app.get('io')?.to(show._id.toString()).emit('seats-updated', {
          showId: show._id.toString(),
          seats: updated.seats
        });
      }

      booking.status = 'cancelled';
      await booking.save();
      return res.json({ booking, message: 'Booking cancelled and seats released.' });
    }

    // In-memory fallback
    try {
      const { booking, updatedShow } = memoryStore.cancelBooking(req.params.id, req.user._id);

      if (updatedShow) {
        req.app.get('io')?.to(updatedShow._id.toString()).emit('seats-updated', {
          showId: updatedShow._id.toString(),
          seats: updatedShow.seats
        });
      }

      res.json({ booking, message: 'Booking cancelled and seats released.' });
    } catch (memErr) {
      return res.status(400).json({ message: memErr.message });
    }
  } catch (e) {
    next(e);
  }
});

export default router;
