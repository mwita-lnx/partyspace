import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  code: string; // 4-digit PIN
  name: string;
  description?: string;
  hostUserId: mongoose.Types.ObjectId; // User who created the session
  hostName: string;
  gameType: 'bet-awards' | 'custom';
  status: 'waiting' | 'active' | 'ended';
  settings: {
    showLiveResults: boolean;
    maxParticipants: number;
  };
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 4
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  hostUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostName: {
    type: String,
    required: true,
    trim: true
  },
  gameType: {
    type: String,
    enum: ['bet-awards', 'custom'],
    default: 'bet-awards',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  settings: {
    showLiveResults: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 50, min: 2, max: 500 }
  },
  startedAt: Date,
  endedAt: Date
}, {
  timestamps: true
});

// Index for faster PIN lookups
GameSessionSchema.index({ code: 1 });

// Index for finding sessions by host
GameSessionSchema.index({ hostUserId: 1 });

// Index for active sessions
GameSessionSchema.index({ status: 1 });

export default mongoose.models.GameSession || mongoose.model<IGameSession>('GameSession', GameSessionSchema);
