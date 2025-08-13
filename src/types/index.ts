import type { Document, Model } from 'mongoose';
import type { Logger } from 'pino';

// Application Configuration Types
export interface AppConfig {
  port: number;
  logger: Logger;
}

// MongoDB Connection Types
export interface MongoConnectionOptions {
  uri: string;
  dbName: string;
  maxRetries?: number;
  retryDelay?: number;
}

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

export interface IImage extends Document {
  taskId: string;
  resolution: string;
  path: string;
  md5: string;
  createdAt: Date;
}

export interface IImageModel extends Model<IImage> {
  findByTaskId(taskId: string): Promise<IImage[]>;
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

// Image Processing Types
export interface ImageProcessingOptions {
  width: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessedImage {
  resolution: string;
  path: string;
  md5: string;
  size: number;
  width: number;
  height: number;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: string;
}



// Validation Schema Types (from Zod)
export type CreateTaskRequestSchema = import('zod').z.infer<typeof import('../common/validation.js').CreateTaskRequestSchema>;
export type GetTaskResponseSchema = import('zod').z.infer<typeof import('../common/validation.js').GetTaskResponseSchema>;
export type ImageSchema = import('zod').z.infer<typeof import('../common/validation.js').ImageSchema>;
