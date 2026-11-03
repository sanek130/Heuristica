const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'python3' },
  verdict: {
    type: String,
    enum: ['Pending','Accepted','WrongAnswer','TimeLimitExceeded','RuntimeError','CompilationError','ServerError'],
    default: 'Pending'
  },
  executionTime: Number,
  memoryUsed: Number,
  testPassed: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  hintsUsed: [Number],
  score: { type: Number, default: 0 },
  judge0Token: String
}, { timestamps: true });

submissionSchema.index({ userId: 1, problemId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
