import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  seatNumbers: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed', index: true },
  paymentStatus: { type: String, enum: ['demo', 'pending', 'paid', 'failed', 'refunded'], default: 'demo' },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });
bookingSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model('Booking', bookingSchema);
