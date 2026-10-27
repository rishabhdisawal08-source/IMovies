import 'dotenv/config';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // fallback
}

import http from 'node:http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import theatreRoutes from './routes/theatres.js';
import showRoutes from './routes/shows.js';
import bookingRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { notFound, errorHandler } from './middleware/errors.js';

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false
}));

// Health check with active database mode status
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    service: 'IMovies API',
    databaseMode: isDbConnected ? 'MongoDB Atlas' : 'In-Memory Resilient Engine',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Socket.IO for real-time seat locks and updates
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

io.on('connection', socket => {
  socket.on('join-show', showId => {
    if (typeof showId === 'string' && showId.length < 100) {
      socket.join(showId);
    }
  });

  socket.on('leave-show', showId => {
    if (typeof showId === 'string') {
      socket.leave(showId);
    }
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`====================================================`);
  console.log(`🎬 IMovies Backend Running at http://localhost:${port}`);
  console.log(`💻 Client Application connected at http://localhost:5173`);
  console.log(`🛡️ Resilient Data Engine: Online`);
  console.log(`====================================================`);

  const tryConnect = () => {
    connectDB().catch(() => {
      console.log('🔄 Retrying MongoDB Atlas connection in 15 seconds...');
      setTimeout(tryConnect, 15000);
    });
  };

  tryConnect();
});
