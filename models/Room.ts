import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession {
  gameType: string;
  category: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed';
  leaderboard?: Array<{
    participantId: mongoose.Types.ObjectId;
    participantName: string;
    score: number;
    rank: number;
  }>;
}

export interface IRoom extends Document {
  code: string;
  name: string;
  description?: string;
  hostId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional: User who created the room (for auth)
  status: 'waiting' | 'active' | 'ended';
  settings: {
    allowLateJoin: boolean;
    showLiveResults: boolean;
    maxParticipants: number;
    votesPerAward: number;
  };
  gameType: string;
  category: 'awards' | 'trivia' | 'icebreaker' | 'party' | 'team-building' | 'creative' | 'question-based' | 'reaction' | 'custom';
  gameSessions: IGameSession[];
  currentGameIndex: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GameSessionSchema = new Schema<IGameSession>({
  gameType: { type: String, required: true },
  category: { type: String, required: true },
  startedAt: { type: Date, required: true },
  endedAt: Date,
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  leaderboard: [{
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant' },
    participantName: String,
    score: Number,
    rank: Number
  }]
});

const RoomSchema = new Schema<IRoom>({
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
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'Participant',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  settings: {
    allowLateJoin: { type: Boolean, default: true },
    showLiveResults: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 50, min: 2, max: 500 },
    votesPerAward: { type: Number, default: 3, min: 1, max: 10 }
  },
  gameType: {
    type: String,
    required: true,
    default: 'custom'
  },
  category: {
    type: String,
    enum: ['awards', 'trivia', 'icebreaker', 'party', 'team-building', 'creative', 'question-based', 'reaction', 'custom'],
    default: 'custom'
  },
  gameSessions: {
    type: [GameSessionSchema],
    default: []
  },
  currentGameIndex: {
    type: Number,
    default: -1
  },
  startedAt: Date,
  endedAt: Date
}, {
  timestamps: true
});

// Index for faster room code lookups
RoomSchema.index({ code: 1 });

// Index for finding rooms by host
RoomSchema.index({ hostId: 1 });

// Index for active rooms
RoomSchema.index({ status: 1 });

export default mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
