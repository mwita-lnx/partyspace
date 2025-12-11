import mongoose, { Schema, Model } from 'mongoose';

export interface IVote {
  participantId: mongoose.Types.ObjectId;
  awardId: mongoose.Types.ObjectId;
  nominee: string;
}

const VoteSchema = new Schema<IVote>({
  participantId: { type: Schema.Types.ObjectId, ref: 'Participant', required: true },
  awardId: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
  nominee: { type: String, required: true }
}, { timestamps: true });

// Ensure one vote per participant per award
VoteSchema.index({ participantId: 1, awardId: 1 }, { unique: true });

const Vote: Model<IVote> = mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;
