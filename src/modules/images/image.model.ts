import mongoose, { Schema } from 'mongoose';
import type { IImage, IImageModel } from './image.types.js';

const ImageSchema = new Schema<IImage>(
  {
    taskId: {
      type: String,
      required: true,
    },
    resolution: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    md5: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false, // We only want createdAt, not updatedAt
    collection: 'images',
  }
);

// Indexes for efficient queries
ImageSchema.index({ taskId: 1 });
ImageSchema.index({ md5: 1 });
ImageSchema.index({ resolution: 1 });
ImageSchema.index({ createdAt: -1 });

// Compound index for efficient task queries
ImageSchema.index({ taskId: 1, resolution: 1 });

// Virtual for file extension
ImageSchema.virtual('extension').get(function() {
  const match = this.path.match(/\.([^.]+)$/);
  return match ? match[1] : '';
});

// Virtual for filename
ImageSchema.virtual('filename').get(function() {
  return this.path.split('/').pop() || '';
});

// Note: Custom static methods can be added later if needed

export const Image = mongoose.model<IImage, IImageModel>('Image', ImageSchema);
