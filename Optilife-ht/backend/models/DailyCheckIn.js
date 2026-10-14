const mongoose = require('mongoose');

// One check-in per user per day. Dates are stored as YYYY-MM-DD strings.
const checkInSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  sleep: { type: Number, required: true, min: 1, max: 10 },
  energy: { type: Number, required: true, min: 1, max: 10 },
  dayQuality: { type: Number, required: true, min: 1, max: 10 },
  readinessScore: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// A unique index makes sure the same user cannot have two check-ins on one date
checkInSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCheckIn', checkInSchema);
