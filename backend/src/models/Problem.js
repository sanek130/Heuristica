const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  theory: String,
  topic: {
    type: String,
    required: true,
    enum: ['arrays','sorting','two_pointers','binary_search','dp','graphs','trees','math','strings']
  },
  difficulty: { type: String, enum: ['municipal','regional','final'], required: true },
  timeLimit: { type: Number, default: 1000 },
  memoryLimit: { type: Number, default: 256 },
  publicTests: [{ input: String, output: String }],
  hiddenTests: [{ input: String, output: String }],
  hints: [{
    level: { type: Number, min: 1, max: 3 },
    text: String,
    penalty: { type: Number, default: 10 }
  }],
  maxScore: { type: Number, default: 100 },
  author: String,
  source: String
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
