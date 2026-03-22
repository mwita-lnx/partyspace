import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IParticipant extends Document {
  name: string;
  code: string;
  roomId: mongoose.Types.ObjectId;
  isHost: boolean;
  hasVoted: boolean;
  votedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  isHost: { type: Boolean, default: false },
  hasVoted: { type: Boolean, default: false },
  votedAt: { type: Date }
}, { timestamps: true });

// Unique code per room (same code can exist in different rooms)
ParticipantSchema.index({ code: 1, roomId: 1 }, { unique: true });

// Find participants by room
ParticipantSchema.index({ roomId: 1 });

const Participant: Model<IParticipant> = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
