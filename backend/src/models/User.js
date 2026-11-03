const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  displayName: String,
  avatar: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  progress: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solved: { type: Boolean, default: false },
    bestScore: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    lastSubmission: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
