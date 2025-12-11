import mongoose, { Schema, Model } from 'mongoose';

export interface IParticipant {
  name: string;
  code: string;
  hasVoted: boolean;
  votedAt?: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  hasVoted: { type: Boolean, default: false },
  votedAt: { type: Date }
}, { timestamps: true });

const Participant: Model<IParticipant> = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
