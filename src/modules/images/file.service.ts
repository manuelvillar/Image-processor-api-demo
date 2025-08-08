import fs from 'fs';
import path from 'path';
import { appConfig } from '../../config/index.js';
import { FileSystemError, ProcessingError } from '../../common/errors.js';

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  type: string;
}

export class FileService {
  private readonly tempDir: string;
  private readonly maxDownloadSize: number;

  constructor() {
    this.tempDir = appConfig.tempDir;
    this.maxDownloadSize = appConfig.maxDownloadSize;
  }

  /**
   * Save uploaded file to temporary directory
   */
  async saveUploadedFile(file: any): Promise<FileInfo> {
    try {
      // Validate file type
      this.validateFileType(file.mimetype);

      // Validate file size
      this.validateFileSize(file.size);

      // Generate unique filename
      const filename = this.generateUniqueFilename(file.originalname);
      const filePath = path.join(this.tempDir, filename);

      // Ensure temp directory exists
      await this.ensureDirectoryExists(this.tempDir);

      // Write file
      fs.writeFileSync(filePath, file.buffer);

      return {
        path: filePath,
        name: filename,
        size: file.size,
        type: file.mimetype,
      };
    } catch (error) {
      throw new FileSystemError(
        `Failed to save uploaded file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Download file from URL and save to temporary directory
   */
  async downloadFromUrl(url: string): Promise<FileInfo> {
    try {
      // Validate URL
      this.validateUrl(url);

      // Download file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new ProcessingError(`Failed to download file from URL: ${response.statusText}`);
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !this.isValidImageType(contentType)) {
        throw new ProcessingError('Invalid image type from URL');
      }

      // Get file size
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;

      if (fileSize > this.maxDownloadSize * 1024 * 1024) {
        throw new ProcessingError(`File size exceeds maximum allowed size of ${this.maxDownloadSize}MB`);
      }

      // Download file
      const buffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(buffer);

      // Validate actual file size
      if (fileBuffer.length > this.maxDownloadSize * 1024 * 1024) {
        throw new ProcessingError(`File size exceeds maximum allowed size of ${this.maxDownloadSize}MB`);
      }

      // Generate filename from URL
      const urlPath = new URL(url).pathname;
      const originalName = path.basename(urlPath) || 'downloaded-image';
      const filename = this.generateUniqueFilename(originalName);
      const filePath = path.join(this.tempDir, filename);

      // Ensure temp directory exists
      await this.ensureDirectoryExists(this.tempDir);

      // Write file
      fs.writeFileSync(filePath, fileBuffer);

      return {
        path: filePath,
        name: filename,
        size: fileBuffer.length,
        type: contentType,
      };
    } catch (error) {
      throw new ProcessingError(
        `Failed to download file from URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't throw - cleanup failures shouldn't break the process
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  }

  /**
   * Validate file type
   */
  private validateFileType(mimetype: string): void {
    if (!this.isValidImageType(mimetype)) {
      throw new ProcessingError(`Invalid file type: ${mimetype}. Allowed types: ${appConfig.allowedImageTypes.join(', ')}`);
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(size: number): void {
    const sizeMB = size / (1024 * 1024);
    if (sizeMB > this.maxDownloadSize) {
      throw new ProcessingError(`File size ${sizeMB.toFixed(2)}MB exceeds maximum allowed size of ${this.maxDownloadSize}MB`);
    }
  }

  /**
   * Validate URL format
   */
  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new ProcessingError('Invalid URL format');
    }
  }

  /**
   * Check if mimetype is a valid image type
   */
  private isValidImageType(mimetype: string): boolean {
    return appConfig.allowedImageTypes.includes(mimetype);
  }

  /**
   * Generate unique filename
   */
  private generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(originalName) || '.jpg';
    const nameWithoutExt = path.basename(originalName, extension);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `${sanitizedName}_${timestamp}_${random}${extension}`;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}

export const fileService = new FileService();
