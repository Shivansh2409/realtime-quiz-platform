const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true
  },
  answer: {
    type: Number,
    default: -1  // -1 indicates no answer
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,  // Time in milliseconds
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const participantSchema = new mongoose.Schema({
visitorId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  socketId: {
    type: String
  },
  responses: [responseSchema],
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isConnected: {
    type: Boolean,
    default: true
  }
});

const sessionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  participants: [participantSchema],
  currentQuestionIndex: {
    type: Number,
    default: -1
  },
  questionStartTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  endedAt: {
    type: Date
  }
});

// Index for quick lookup by code
sessionSchema.index({ code: 1 });

module.exports = mongoose.model('Session', sessionSchema);
