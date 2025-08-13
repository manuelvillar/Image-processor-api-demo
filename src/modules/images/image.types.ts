import type { Document, Model } from 'mongoose';
import type { Buffer } from 'node:buffer';

// Database Model Types
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

// File Service Types
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
