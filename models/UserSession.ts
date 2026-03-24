import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  sessionCode: string;
  sessionName: string;
  role: 'host' | 'participant';
  joinedAt: Date;
  lastAccessedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'GameSession',
    required: true
  },
  sessionCode: {
    type: String,
    required: true,
    trim: true
  },
  sessionName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['host', 'participant'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique user-session pairs
UserSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
UserSessionSchema.index({ userId: 1, lastAccessedAt: -1 });

export default mongoose.models.UserSession || mongoose.model<IUserSession>('UserSession', UserSessionSchema);
