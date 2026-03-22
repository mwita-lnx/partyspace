import mongoose, { Schema, Model } from 'mongoose';

export interface IAward {
  roomId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  nominees: string[];
  emoji: string;
  order: number;
  type?: 'voting' | 'opinion' | 'trivia' | 'multiple-choice' | 'ranking' | 'open-ended' | 'true-false' | 'speed-challenge' | 'color-match' | 'tap-battle' | 'quick-math' | 'word-race' | 'memory-flash' | 'reflex-test';
  options?: string[]; // For multiple-choice questions
  correctAnswer?: string; // For trivia questions
  timeLimit?: number; // In seconds
  gameSettings?: Record<string, any>; // Game-specific settings per room
}

const AwardSchema = new Schema<IAward>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  nominees: [{ type: String, trim: true }],
  emoji: { type: String, default: '🏆' },
  order: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['voting', 'opinion', 'trivia', 'multiple-choice', 'ranking', 'open-ended', 'true-false', 'speed-challenge', 'color-match', 'tap-battle', 'quick-math', 'word-race', 'memory-flash', 'reflex-test'],
    default: 'voting'
  },
  options: [{ type: String, trim: true }],
  correctAnswer: { type: String, trim: true },
  timeLimit: { type: Number, min: 5, max: 300 },
  gameSettings: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Find awards by room
AwardSchema.index({ roomId: 1, order: 1 });

const Award: Model<IAward> = mongoose.models.Award || mongoose.model<IAward>('Award', AwardSchema);

export default Award;
