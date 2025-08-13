import type { Document, Model } from 'mongoose';

// Database Model Types
export interface ITask extends Document {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  originalPath?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  images?: Array<{
    resolution: string;
    path: string;
    md5: string;
    createdAt: Date;
  }>;
}

export interface ITaskModel extends Model<ITask> {
  findByTaskId(taskId: string): Promise<ITask | null>;
}

// Request/Response Types
export interface CreateTaskRequest {
  imageUrl?: string | undefined;
  imageFile?: string | undefined;
}

export interface TaskResult {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  originalPath?: string | undefined;
  error?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | undefined;
  images?: ImageResult[] | undefined;
}

export interface ImageResult {
  resolution: '1024' | '800';
  path: string;
  md5: string;
  createdAt: Date;
}
