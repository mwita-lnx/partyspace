import mongoose, { Schema, Model } from 'mongoose';

export interface IAward {
  title: string;
  description: string;
  nominees: string[];
  emoji: string;
}

const AwardSchema = new Schema<IAward>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  nominees: [{ type: String }],
  emoji: { type: String, default: '🏆' }
}, { timestamps: true });

const Award: Model<IAward> = mongoose.models.Award || mongoose.model<IAward>('Award', AwardSchema);

export default Award;
