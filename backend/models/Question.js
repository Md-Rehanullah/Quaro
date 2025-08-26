const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: String,
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  answers: [answerSchema]
});

module.exports = mongoose.model('Question', questionSchema);