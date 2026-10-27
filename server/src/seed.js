import 'dotenv/config';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback
}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import User from './models/User.js';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';
import Booking from './models/Booking.js';
import { connectDB } from './config/db.js';

const sampleMovies = [
  {
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    genre: ['Biography', 'Drama', 'History'],
    language: 'English',
    durationMinutes: 180,
    rating: 8.9,
    active: true
  },
  {
    title: 'Dune: Part Two',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    durationMinutes: 166,
    rating: 8.8,
    active: true
  },
  {
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival on a distant world.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    language: 'English',
    durationMinutes: 169,
    rating: 8.7,
    active: true
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80',
    genre: ['Animation', 'Action', 'Adventure'],
    language: 'English',
    durationMinutes: 140,
    rating: 8.7,
    active: true
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    genre: ['Action', 'Crime', 'Drama'],
    language: 'English',
    durationMinutes: 152,
    rating: 9.0,
    active: true
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    durationMinutes: 148,
    rating: 8.8,
    active: true
  }
];

const sampleTheatres = [
  { name: 'PVR ICON: Gold Class', location: 'Bandra West, Mumbai', screens: 5 },
  { name: 'IMAX Laser Experience', location: 'Phoenix Marketcity, Bengaluru', screens: 6 },
  { name: 'Cinépolis VIP Grand', location: 'Connaught Place, New Delhi', screens: 4 },
  { name: 'INOX Megaplex Dolby Atmos', location: 'Banjara Hills, Hyderabad', screens: 6 }
];

function generateSeatMatrix(rows = 6, cols = 10, preBooked = []) {
  const seats = [];
  for (let r = 0; r < rows; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    for (let c = 1; c <= cols; c++) {
      const seatNumber = `${rowLetter}${c}`;
      seats.push({
        seatNumber,
        status: preBooked.includes(seatNumber) ? 'booked' : 'available'
      });
    }
  }
  return seats;
}

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas for seeding...');
    await connectDB();

    console.log('Clearing existing collections in imovies database...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({})
    ]);

    console.log('Creating demo users...');
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    const demoPassword = await bcrypt.hash('Demo@123456', 12);

    const adminUser = await User.create({
      name: 'Admin Director',
      email: 'admin@imovies.com',
      password: hashedPassword,
      role: 'admin'
    });

    const demoUser = await User.create({
      name: 'John Doe',
      email: 'demo@imovies.com',
      password: demoPassword,
      role: 'user'
    });

    console.log('Inserting movies...');
    const createdMovies = await Movie.insertMany(sampleMovies);

    console.log('Inserting theatres...');
    const createdTheatres = await Theatre.insertMany(sampleTheatres);

    console.log('Generating shows and seat matrices...');
    const now = new Date();
    const showsToCreate = [];

    // Schedule shows for today and the next 3 days
    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      for (let i = 0; i < createdMovies.length; i++) {
        const movie = createdMovies[i];
        const theatre = createdTheatres[i % createdTheatres.length];

        const showDate1 = new Date(now);
        showDate1.setDate(now.getDate() + dayOffset);
        showDate1.setHours(15 + (i % 3) * 2, 30, 0, 0);

        const showDate2 = new Date(now);
        showDate2.setDate(now.getDate() + dayOffset);
        showDate2.setHours(20 + (i % 2), 0, 0, 0);

        // Pre-book some seats for realism
        const booked1 = ['B3', 'B4', 'C5', 'D6'];
        const booked2 = ['C1', 'C2', 'E4', 'E5'];

        showsToCreate.push({
          movie: movie._id,
          theatre: theatre._id,
          startsAt: showDate1,
          price: 320 + (i % 3) * 50,
          seats: generateSeatMatrix(6, 10, booked1),
          active: true
        });

        showsToCreate.push({
          movie: movie._id,
          theatre: theatre._id,
          startsAt: showDate2,
          price: 380 + (i % 2) * 60,
          seats: generateSeatMatrix(6, 10, booked2),
          active: true
        });
      }
    }

    const createdShows = await Show.insertMany(showsToCreate);

    console.log('Creating sample booking for demo user...');
    const firstShow = createdShows[0];
    await Booking.create({
      user: demoUser._id,
      show: firstShow._id,
      movie: firstShow.movie,
      seatNumbers: ['B3', 'B4'],
      totalAmount: firstShow.price * 2,
      bookingCode: `IM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      status: 'confirmed',
      paymentStatus: 'demo'
    });

    console.log('\n======================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY IN MONGODB ATLAS!');
    console.log('======================================================');
    console.log(`👤 Admin Account : admin@imovies.com / Admin@123456`);
    console.log(`👤 Demo User     : demo@imovies.com / Demo@123456`);
    console.log(`🎬 Movies Created : ${createdMovies.length}`);
    console.log(`🏢 Theatres Created: ${createdTheatres.length}`);
    console.log(`🎟️ Shows Created  : ${createdShows.length}`);
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
