import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITask extends Document {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  originalPath: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  images?: Array<{
    resolution: string;
    path: string;
    md5: string;
    createdAt: Date;
  }>;
}

export interface ITaskModel extends Model<ITask> {
  // Custom methods can be added here later
}

const TaskSchema = new Schema<ITask>(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
      required: true,
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
