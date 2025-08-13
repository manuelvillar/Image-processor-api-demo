import mongoose, { Schema } from 'mongoose';
import type { ITask, ITaskModel } from './task.types.js';

const TaskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    price: {
      type: Number,
      required: true,
      min: 5,
      max: 50,
    },
    originalPath: {
      type: String,
      required: false, // Will be set after file download/upload
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    images: [
      {
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
    ],
  },
  {
    timestamps: true,
    collection: 'tasks',
  }
);

// Indexes for efficient queries
TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ createdAt: -1 });

// Virtual for formatted price
TaskSchema.virtual('formattedPrice').get(function() {
  return this.price.toFixed(2);
});

export const Task = mongoose.model<ITask, ITaskModel>('Task', TaskSchema);
