import mongoose, { Schema, Model } from 'mongoose';

export interface IVote {
  roomId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  awardId: mongoose.Types.ObjectId;
  nominee: string; // For voting type (participant name)
  answer?: string; // For multiple-choice, true-false, open-ended
  ranking?: string[]; // For ranking type (ordered list)
  timeSpent?: number; // For speed challenges (in seconds)
  isCorrect?: boolean; // For trivia questions
}

const VoteSchema = new Schema<IVote>({
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  participantId: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
  awardId: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
  nominee: { type: String, trim: true },
  answer: { type: String, trim: true },
  ranking: [{ type: String, trim: true }],
  timeSpent: { type: Number, min: 0 },
  isCorrect: { type: Boolean }
}, { timestamps: true });

// Allow multiple votes per participant per award, but prevent duplicate votes for same nominee
VoteSchema.index({ participantId: 1, awardId: 1, nominee: 1 }, { unique: true });

// Find votes by room for isolation
VoteSchema.index({ roomId: 1 });

// Find votes by award within a room
VoteSchema.index({ roomId: 1, awardId: 1 });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
