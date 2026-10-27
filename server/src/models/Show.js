import mongoose from 'mongoose';
const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  status: { type: String, enum: ['available', 'booked'], default: 'available' }
}, { _id: false });
const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
  startsAt: { type: Date, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  seats: { type: [seatSchema], default: [] },
  active: { type: Boolean, default: true }
}, { timestamps: true });
showSchema.index({ movie: 1, startsAt: 1 });
export default mongoose.model('Show', showSchema);
