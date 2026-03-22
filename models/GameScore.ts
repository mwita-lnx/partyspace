import mongoose from 'mongoose';

const GameScoreSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
    index: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
    required: true,
    index: true
  },
  awardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Award',
    required: true,
    index: true
  },
  // Index in room.gameSessions array - tracks which game session this score belongs to
  sessionIndex: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  gameType: {
    type: String,
    required: true
  },
  // Primary score for leaderboard
  score: {
    type: Number,
    required: true,
    default: 0
  },
  // Flexible game-specific metrics
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Time spent on this challenge
  timeSpent: {
    type: Number,
    default: 0
  },
  // For quiz/trivia games
  isCorrect: {
    type: Boolean
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
GameScoreSchema.index({ roomId: 1, participantId: 1 });
GameScoreSchema.index({ roomId: 1, awardId: 1 });
GameScoreSchema.index({ roomId: 1, sessionIndex: 1 });
GameScoreSchema.index({ roomId: 1, sessionIndex: 1, participantId: 1 });

export default mongoose.models.GameScore || mongoose.model('GameScore', GameScoreSchema);
