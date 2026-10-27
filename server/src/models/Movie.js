import mongoose from 'mongoose';
const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  posterUrl: { type: String, default: '' },
  genre: [{ type: String, trim: true, index: true }],
  language: { type: String, default: 'Hindi', index: true },
  durationMinutes: { type: Number, min: 1, default: 120 },
  rating: { type: Number, min: 0, max: 10, default: 0 },
  releaseDate: { type: Date },
  active: { type: Boolean, default: true, index: true }
}, { timestamps: true });
movieSchema.index({ title: 'text', description: 'text' });
export default mongoose.model('Movie', movieSchema);
