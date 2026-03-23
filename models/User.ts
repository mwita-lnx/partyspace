import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string; // Optional: for email/password auth
  authProvider?: 'email' | 'google' | 'github'; // Auth method
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    select: false // Don't return password by default
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'github'],
    default: 'email'
  }
}, {
  timestamps: true
});

// Index for faster email lookups
UserSchema.index({ email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
