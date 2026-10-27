# 🎬 iMOVIES &mdash; Full Stack MERN Cinema Ticketing Platform

> A production-ready, full-stack movie ticket reservation platform featuring **MongoDB**, **Express**, **React 18**, **Node.js**, **Socket.IO** real-time seat synchronization, and **atomic double-booking protection**.

---

## 🌟 Highlights & Key Features

- **🛡️ Collision-Free Seat Booking (Atomic Updates)**:
  Uses MongoDB's conditional `findOneAndUpdate` with `arrayFilters` and `$elemMatch` to atomically lock seats. Prevents race conditions and double-booking even when hundreds of users simultaneously attempt to book the same seat.
- **⚡ Real-Time Socket.IO Synchronization**:
  When any user reserves or cancels seats, all connected users looking at that show's auditorium seat map see the updates instantaneously without reloading the page.
- **🎟️ Digital E-Ticket & Pass Modal**:
  Generates a boarding-pass-style cinema ticket complete with verified booking code, movie details, hall & seat assignments, price breakdown, simulated barcode, and print/PDF download support (`Ctrl + P` / Print).
- **👑 Full-Featured Admin Studio**:
  - **Overview Analytics**: Real-time revenue (₹), tickets sold, active shows, registered patrons, and recent transaction feeds.
  - **Movie Management**: Publish new movies with poster URLs, descriptions, runtime, languages, and genres.
  - **Theatre Multiplexes**: Create theatres with custom locations, screens, and auditoriums.
  - **Show Scheduling**: Schedule shows by selecting movie, theatre, date & time, ticket pricing, and customizable row/seat dimensions (e.g. 6 rows × 10 seats).
- **🔐 JWT Authentication & Role-Based Access (RBAC)**:
  Secure password hashing with `bcryptjs`, JWT bearer authorization, and route-level guards for authenticated users and administrators.
- **⚡ Quick-Fill Demo Credentials**:
  Pre-configured one-click credentials on the login screen for testing both **Demo Guest** and **Admin Director** accounts.
- **📱 Responsive Cinematic Dark Theme**:
  Engineered with a modern cinema aesthetic (deep obsidian, neon violet, electric indigo, gold accents, curved auditorium screen glow, and smooth transitions).

---

## 🏗️ Architecture & Tech Stack

```
imovies-mern/
├── client/                     # React 18 + Vite Frontend
│   ├── index.html
│   ├── vite.config.js          # Vite config with React plugin & API proxy
│   ├── package.json
│   └── src/
│       ├── api.js              # Axios instance with JWT interceptor
│       ├── App.jsx             # React Router setup & Route Guards
│       ├── main.jsx            # Application entry point
│       ├── style.css           # Cinematic CSS design system
│       ├── context/
│       │   └── AuthContext.jsx # Global user auth state & tokens
│       ├── components/
│       │   ├── Navbar.jsx      # Sticky responsive navigation & profile badge
│       │   ├── Footer.jsx      # Footer with quick links & tech badges
│       │   ├── MovieCard.jsx   # Poster cards with rating & hover effects
│       │   ├── SeatMap.jsx     # Interactive auditorium seat matrix
│       │   └── TicketModal.jsx # Digital cinema boarding pass with print view
│       └── pages/
│           ├── HomePage.jsx         # Hero showcase, search, & genre filters
│           ├── MovieDetailsPage.jsx # Movie info, date tabs, & showtime slots
│           ├── BookingPage.jsx      # Live seat picker with Socket.IO sync
│           ├── MyBookingsPage.jsx   # Ticket wallet & booking cancellations
│           ├── AdminPage.jsx        # Admin dashboard, movies, theatres, shows
│           ├── AuthPage.jsx         # Sign in / Register with demo quick-fills
│           └── NotFoundPage.jsx     # 404 handler
│
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── package.json
│   ├── .env.example            # Environment template
│   ├── .env                    # Configured environment variables
│   └── src/
│       ├── index.js            # Express server & Socket.IO initialization
│       ├── seed.js             # Database seeder script
│       ├── config/
│       │   └── db.js           # Mongoose MongoDB connection
│       ├── middleware/
│       │   ├── auth.js         # JWT verification & adminOnly guard
│       │   └── errors.js       # Global 404 and error handling
│       ├── models/
│       │   ├── User.js         # Name, email, hashed password, role
│       │   ├── Movie.js        # Title, synopsis, poster, genre, rating
│       │   ├── Theatre.js      # Name, location, screens count
│       │   ├── Show.js         # Movie ref, theatre ref, time, price, seat matrix
│       │   └── Booking.js      # User ref, show ref, seat numbers, booking code
│       └── routes/
│           ├── auth.js         # /api/auth (register, login, me)
│           ├── movies.js       # /api/movies (browse, search, admin CRUD)
│           ├── theatres.js     # /api/theatres (list, admin CRUD)
│           ├── shows.js        # /api/shows (filter by movie/theatre, schedule)
│           ├── bookings.js     # /api/bookings (atomic book, cancel, my bookings)
│           └── admin.js        # /api/admin/metrics (revenue & analytics)
│
└── package.json                # Root package for concurrent multi-service runs
```

---

## ⚡ Quick Start & Run Guide

### 1. Prerequisites
- **Node.js** (v18 or v20 LTS recommended): [Download Node.js](https://nodejs.org)
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

### 2. Install Dependencies
Open a terminal in the `imovies-mern` root folder and run:
```bash
# Install root dev dependencies (concurrently)
npm install

# Install both backend and frontend dependencies
npm run install:all
```

### 3. Seed Database (Optional but Recommended)
Populates demo blockbusters, multiplex theatres, shows across upcoming days, sample bookings, and ready-to-use user and admin accounts:
```bash
npm run seed
```

### 4. Start the Application
Start both the Express backend (Port 5000) and the React Vite client (Port 5173) with a single command:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Pre-Configured Demo Accounts

After running `npm run seed`, you can instantly log in via the quick-fill buttons or manually with:

| Account Type | Email | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **👑 Admin Director** | `admin@imovies.com` | `Admin@123456` | Full platform control: add movies, theatres, schedule shows, view platform revenue & all bookings |
| **👤 Demo Guest** | `demo@imovies.com` | `Demo@123456` | Book tickets, view digital passes in wallet, cancel future reservations |

---

## 📡 API Reference Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Sign in & receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch active user profile | Authenticated |

### Movies (`/api/movies`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/movies` | Get movies (supports `search`, `genre`, `language`) | Public |
| `GET` | `/api/movies/:id` | Get movie details by ID | Public |
| `POST` | `/api/movies` | Add new movie listing | Admin |
| `PUT` | `/api/movies/:id` | Update movie details | Admin |
| `DELETE` | `/api/movies/:id` | Deactivate movie | Admin |

### Theatres (`/api/theatres`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/theatres` | Get all cinema theatres | Public |
| `GET` | `/api/theatres/:id` | Get theatre details by ID | Public |
| `POST` | `/api/theatres` | Create a new multiplex theatre | Admin |
| `DELETE` | `/api/theatres/:id` | Remove theatre | Admin |

### Shows (`/api/shows`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/shows` | Get upcoming shows (`movieId`, `theatreId`, `date`) | Public |
| `GET` | `/api/shows/:id` | Get show details with live seat matrix | Public |
| `POST` | `/api/shows` | Schedule show and generate seat layout | Admin |
| `DELETE` | `/api/shows/:id` | Deactivate show | Admin |

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Atomically reserve seats (broadcasts Socket.IO event) | Authenticated |
| `GET` | `/api/bookings/my` | View user's ticket wallet | Authenticated |
| `GET` | `/api/bookings/:id` | Get single ticket receipt | Authenticated |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking & release seats | Authenticated |
| `GET` | `/api/bookings/admin/all` | View all platform bookings | Admin |

### Admin Analytics (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/metrics` | Total revenue, bookings, shows, and recent orders | Admin |

---

## 🛡️ Atomic Double-Booking Mechanism Explained

To guarantee zero race conditions during peak ticket drops, IMovies employs conditional atomic updates:

```javascript
const show = await Show.findOneAndUpdate(
  {
    _id: showId,
    active: true,
    startsAt: { $gt: new Date() },
    seats: {
      $all: uniqueSeats.map(seatNumber => ({
        $elemMatch: { seatNumber, status: 'available' }
      }))
    }
  },
  {
    $set: Object.fromEntries(
      uniqueSeats.map((s, i) => [`seats.$[seat${i}].status`, 'booked'])
    )
  },
  {
    new: true,
    arrayFilters: uniqueSeats.map((s, i) => ({
      [`seat${i}.seatNumber`]: s,
      [`seat${i}.status`]: 'available'
    }))
  }
);
```

If even a single seat in the user's selection was booked by someone else a millisecond earlier, MongoDB's query fails to match, returns `null`, and rejects the transaction with HTTP 409 Conflict without corrupting any data.

---

## 🚢 Production Deployment Recommendations

1. **MongoDB Atlas**:
   Set `MONGO_URI` in `server/.env` to your production MongoDB Atlas cluster string.
2. **Environment Secrets**:
   Generate a secure 64-character random string for `JWT_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. **CORS & Client URL**:
   Set `CLIENT_URL` on the server to your deployed frontend domain (e.g. `https://imovies.vercel.app`).
4. **Vite Production Build**:
   Build the frontend for production:
   ```bash
   npm run build --prefix client
   ```
   Deploy static assets to Vercel, Netlify, or serve directly via Express.
