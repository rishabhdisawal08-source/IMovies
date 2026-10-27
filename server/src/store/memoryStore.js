import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Pre-seeded demo movies
const initialMovies = [
  {
    _id: '671ee0000000000000000001',
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
    _id: '671ee0000000000000000002',
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
    _id: '671ee0000000000000000003',
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
    _id: '671ee0000000000000000004',
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
    _id: '671ee0000000000000000005',
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
    _id: '671ee0000000000000000006',
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

// Pre-seeded theatres
const initialTheatres = [
  { _id: '671ef0000000000000000001', name: 'PVR ICON: Gold Class', location: 'Bandra West, Mumbai', screens: 5 },
  { _id: '671ef0000000000000000002', name: 'IMAX Laser Experience', location: 'Phoenix Marketcity, Bengaluru', screens: 6 },
  { _id: '671ef0000000000000000003', name: 'Cinépolis VIP Grand', location: 'Connaught Place, New Delhi', screens: 4 },
  { _id: '671ef0000000000000000004', name: 'INOX Megaplex Dolby Atmos', location: 'Banjara Hills, Hyderabad', screens: 6 }
];

function generateSeats(rows = 6, cols = 10, preBooked = []) {
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

// Generate dynamic upcoming shows
function generateInitialShows() {
  const shows = [];
  const now = new Date();
  let showCounter = 1;

  for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
    for (let i = 0; i < initialMovies.length; i++) {
      const movie = initialMovies[i];
      const theatre = initialTheatres[i % initialTheatres.length];

      const d1 = new Date(now);
      d1.setDate(now.getDate() + dayOffset);
      d1.setHours(15 + (i % 3) * 2, 30, 0, 0);

      const d2 = new Date(now);
      d2.setDate(now.getDate() + dayOffset);
      d2.setHours(20 + (i % 2), 0, 0, 0);

      const idHex1 = showCounter.toString().padStart(24, '0');
      shows.push({
        _id: idHex1,
        movie,
        theatre,
        startsAt: d1,
        price: 320 + (i % 3) * 50,
        seats: generateSeats(6, 10, ['B3', 'B4', 'C5', 'D6']),
        active: true
      });
      showCounter++;

      const idHex2 = showCounter.toString().padStart(24, '0');
      shows.push({
        _id: idHex2,
        movie,
        theatre,
        startsAt: d2,
        price: 380 + (i % 2) * 60,
        seats: generateSeats(6, 10, ['C1', 'C2', 'E4', 'E5']),
        active: true
      });
      showCounter++;
    }
  }
  return shows;
}

class MemoryStore {
  constructor() {
    this.movies = [...initialMovies];
    this.theatres = [...initialTheatres];
    this.shows = generateInitialShows();
    this.users = [];
    this.bookings = [];

    // Pre-seed demo users
    const adminHash = bcrypt.hashSync('Admin@123456', 10);
    const demoHash = bcrypt.hashSync('Demo@123456', 10);

    this.users.push({
      _id: '671ea0000000000000000001',
      name: 'Admin Director',
      email: 'admin@imovies.com',
      password: adminHash,
      role: 'admin'
    });

    this.users.push({
      _id: '671ea0000000000000000002',
      name: 'John Doe',
      email: 'demo@imovies.com',
      password: demoHash,
      role: 'user'
    });

    // Pre-seed a booking for demo user
    const firstShow = this.shows[0];
    this.bookings.push({
      _id: '671eb0000000000000000001',
      user: this.users[1]._id,
      show: firstShow,
      movie: firstShow.movie,
      seatNumbers: ['B3', 'B4'],
      totalAmount: firstShow.price * 2,
      bookingCode: 'IM-DEMO7788',
      status: 'confirmed',
      paymentStatus: 'demo',
      createdAt: new Date()
    });
  }

  // --- MOVIES ---
  getMovies(search = '', genre = '', language = '') {
    return this.movies.filter(m => {
      if (!m.active) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.description?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (genre && !m.genre?.some(g => g.toLowerCase() === genre.toLowerCase())) {
        return false;
      }
      if (language && m.language?.toLowerCase() !== language.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  getMovieById(id) {
    return this.movies.find(m => m._id.toString() === id.toString() && m.active);
  }

  createMovie(data) {
    const movie = {
      _id: new crypto.randomBytes(12).toString('hex'),
      active: true,
      rating: 8.0,
      language: 'English',
      durationMinutes: 120,
      ...data
    };
    this.movies.unshift(movie);
    return movie;
  }

  deactivateMovie(id) {
    const movie = this.movies.find(m => m._id.toString() === id.toString());
    if (movie) movie.active = false;
    return movie;
  }

  // --- THEATRES ---
  getTheatres() {
    return this.theatres;
  }

  getTheatreById(id) {
    return this.theatres.find(t => t._id.toString() === id.toString());
  }

  createTheatre(data) {
    const theatre = {
      _id: new crypto.randomBytes(12).toString('hex'),
      screens: 1,
      ...data
    };
    this.theatres.push(theatre);
    return theatre;
  }

  deleteTheatre(id) {
    const idx = this.theatres.findIndex(t => t._id.toString() === id.toString());
    if (idx !== -1) {
      this.theatres.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- SHOWS ---
  getShows({ movieId, theatreId, date, all } = {}) {
    const now = new Date();
    return this.shows.filter(s => {
      if (!s.active) return false;
      if (all !== 'true' && new Date(s.startsAt) < now) return false;
      if (movieId && s.movie?._id.toString() !== movieId.toString()) return false;
      if (theatreId && s.theatre?._id.toString() !== theatreId.toString()) return false;
      if (date) {
        const sDate = new Date(s.startsAt).toISOString().split('T')[0];
        if (sDate !== date) return false;
      }
      return true;
    });
  }

  getShowById(id) {
    return this.shows.find(s => s._id.toString() === id.toString());
  }

  createShow(data) {
    const movie = this.getMovieById(data.movie);
    const theatre = this.getTheatreById(data.theatre);
    const seats = generateSeats(Number(data.rows) || 6, Number(data.seatsPerRow) || 10);

    const show = {
      _id: new crypto.randomBytes(12).toString('hex'),
      movie,
      theatre,
      startsAt: new Date(data.startsAt),
      price: Number(data.price),
      seats,
      active: true
    };
    this.shows.push(show);
    return show;
  }

  deactivateShow(id) {
    const show = this.shows.find(s => s._id.toString() === id.toString());
    if (show) show.active = false;
    return show;
  }

  // --- BOOKINGS (Atomic seat locking in memory) ---
  bookSeats(userId, showId, seatNumbers) {
    const show = this.shows.find(s => s._id.toString() === showId.toString());
    if (!show) throw new Error('Show not found.');

    // Check availability
    for (const seatNum of seatNumbers) {
      const seat = show.seats.find(s => s.seatNumber === seatNum);
      if (!seat || seat.status !== 'available') {
        throw new Error(`Seat ${seatNum} is no longer available.`);
      }
    }

    // Atomically reserve seats
    for (const seatNum of seatNumbers) {
      const seat = show.seats.find(s => s.seatNumber === seatNum);
      if (seat) seat.status = 'booked';
    }

    const booking = {
      _id: new crypto.randomBytes(12).toString('hex'),
      user: userId,
      show,
      movie: show.movie,
      seatNumbers,
      totalAmount: show.price * seatNumbers.length,
      bookingCode: `IM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      status: 'confirmed',
      paymentStatus: 'demo',
      createdAt: new Date()
    };

    this.bookings.unshift(booking);
    return { booking, updatedShow: show };
  }

  getBookingsByUser(userId) {
    return this.bookings.filter(b => b.user?.toString() === userId.toString());
  }

  getAllBookings() {
    return this.bookings;
  }

  cancelBooking(bookingId, userId) {
    const booking = this.bookings.find(b => b._id.toString() === bookingId.toString());
    if (!booking) throw new Error('Booking not found.');
    if (booking.status === 'cancelled') throw new Error('Booking already cancelled.');

    const show = booking.show;
    if (show && show.seats) {
      for (const seatNum of booking.seatNumbers) {
        const seat = show.seats.find(s => s.seatNumber === seatNum);
        if (seat) seat.status = 'available';
      }
    }

    booking.status = 'cancelled';
    return { booking, updatedShow: show };
  }

  // --- AUTH ---
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id.toString() === id.toString());
  }

  createUser(name, email, password) {
    const existing = this.findUserByEmail(email);
    if (existing) throw new Error('An account with this email already exists.');

    const user = {
      _id: new crypto.randomBytes(12).toString('hex'),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: bcrypt.hashSync(password, 12),
      role: 'user'
    };
    this.users.push(user);
    return user;
  }
}

export const memoryStore = new MemoryStore();
