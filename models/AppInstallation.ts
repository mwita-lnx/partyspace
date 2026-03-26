import mongoose, { Schema, Document } from 'mongoose';

export interface IAppInstallation extends Document {
  userId?: string; // Optional: link to user if authenticated
  installDate: Date;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenResolution?: string;
  };
  installSource?: 'android' | 'ios' | 'desktop' | 'other';
  isUninstalled: boolean;
  uninstallDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AppInstallationSchema = new Schema<IAppInstallation>({
  userId: {
    type: String,
    required: false
  },
  installDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    language: String,
    screenResolution: String
  },
  installSource: {
    type: String,
    enum: ['android', 'ios', 'desktop', 'other'],
    default: 'other'
  },
  isUninstalled: {
    type: Boolean,
    default: false
  },
  uninstallDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for faster queries
AppInstallationSchema.index({ installDate: -1 });
AppInstallationSchema.index({ userId: 1 });
AppInstallationSchema.index({ isUninstalled: 1 });

export default mongoose.models.AppInstallation || mongoose.model<IAppInstallation>('AppInstallation', AppInstallationSchema);
