import mongoose, { Schema, Model } from 'mongoose';

export interface IVote {
  sessionId: mongoose.Types.ObjectId;
  voterName: string; // Anonymous voter name
  voterEmail?: string; // Optional email if they logged in
  awardId: mongoose.Types.ObjectId;
  nominee: string; // For voting type (participant name)
  answer?: string; // For multiple-choice, true-false, open-ended
  ranking?: string[]; // For ranking type (ordered list)
  timeSpent?: number; // For speed challenges (in seconds)
  isCorrect?: boolean; // For trivia questions
}

const VoteSchema = new Schema<IVote>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true },
  voterName: { type: String, required: true, trim: true },
  voterEmail: { type: String, trim: true, lowercase: true },
  awardId: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
  nominee: { type: String, trim: true },
  answer: { type: String, trim: true },
  ranking: [{ type: String, trim: true }],
  timeSpent: { type: Number, min: 0 },
  isCorrect: { type: Boolean }
}, { timestamps: true });

// Allow one vote per person per award
VoteSchema.index({ sessionId: 1, voterName: 1, awardId: 1 }, { unique: true });

// Find votes by session
VoteSchema.index({ sessionId: 1 });

// Find votes by award within a session
VoteSchema.index({ sessionId: 1, awardId: 1 });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
