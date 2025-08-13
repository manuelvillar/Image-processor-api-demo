import sharp from 'sharp';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { appConfig } from '../../config/index.js';
import { FileSystemError, ProcessingError } from '../../common/errors.js';
import type { ProcessedImage } from './image.types.js';

export class ImageService {
  private readonly outputDir: string;
  private readonly maxDownloadSize: number;

  constructor() {
    this.outputDir = appConfig.outputDir;
    this.maxDownloadSize = appConfig.maxDownloadSize;
  }

  /**
   * Process an image file and create variants at specified resolutions
   */
  async processImage(
    sourcePath: string,
    originalName: string,
    resolutions: number[] = [1024, 800]
  ): Promise<ProcessedImage[]> {
    try {
      // Validate source file
      await this.validateSourceFile(sourcePath);

      // Read and validate image
      const imageBuffer = await this.readImageFile(sourcePath);
      const imageInfo = await this.getImageInfo(imageBuffer);

      // Create output directory structure
      const baseOutputPath = path.join(this.outputDir, this.sanitizeFileName(originalName));
      await this.ensureDirectoryExists(baseOutputPath);

      const processedImages: ProcessedImage[] = [];

      // Process each resolution
      for (const width of resolutions) {
        const processedImage = await this.createImageVariant(
          imageBuffer,
          imageInfo,
          baseOutputPath,
          width
        );
        processedImages.push(processedImage);
      }

      return processedImages;
    } catch (error) {
      throw new ProcessingError(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate the source file exists and is within size limits
   */
  private async validateSourceFile(sourcePath: string): Promise<void> {
    if (!fs.existsSync(sourcePath)) {
      throw new FileSystemError(`Source file not found: ${sourcePath}`);
    }

    const stats = fs.statSync(sourcePath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > this.maxDownloadSize) {
      throw new FileSystemError(
        `File size ${fileSizeMB.toFixed(2)}MB exceeds maximum allowed size of ${this.maxDownloadSize}MB`
      );
    }
  }

  /**
   * Read image file and return buffer
   */
  private async readImageFile(sourcePath: string): Promise<Buffer> {
    try {
      return fs.readFileSync(sourcePath);
    } catch (error) {
      throw new FileSystemError(`Failed to read image file: ${sourcePath}`);
    }
  }

  /**
   * Get image information using Sharp
   */
  private async getImageInfo(imageBuffer: Buffer): Promise<sharp.Metadata> {
    try {
      return await sharp(imageBuffer).metadata();
    } catch (error) {
      throw new ProcessingError('Invalid image format or corrupted image file');
    }
  }

  /**
   * Create an image variant at specified width
   */
  private async createImageVariant(
    imageBuffer: Buffer,
    imageInfo: sharp.Metadata,
    baseOutputPath: string,
    targetWidth: number
  ): Promise<ProcessedImage> {
    const resolution = targetWidth.toString();
    const resolutionDir = path.join(baseOutputPath, resolution);
    await this.ensureDirectoryExists(resolutionDir);

    // Calculate height maintaining aspect ratio
    const aspectRatio = (imageInfo.height || 1) / (imageInfo.width || 1);
    const targetHeight = Math.round(targetWidth * aspectRatio);

    // Process image with Sharp
    const processedBuffer = await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate MD5 hash
    const md5 = crypto.createHash('md5').update(processedBuffer).digest('hex');

    // Determine file extension
    const extension = 'jpg';
    const filename = `${md5}.${extension}`;
    const outputPath = path.join(resolutionDir, filename);

    // Write file
    fs.writeFileSync(outputPath, processedBuffer);

    // Return relative path for database storage
    const relativePath = path.join('/output', this.sanitizeFileName(path.basename(baseOutputPath)), resolution, filename);

    return {
      resolution,
      path: relativePath,
      md5,
      size: processedBuffer.length,
      width: targetWidth,
      height: targetHeight,
    };
  }

  /**
   * Ensure directory exists, create if it doesn't
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Sanitize filename for safe file system operations
   */
  private sanitizeFileName(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Generate MD5 hash for a file
   */
  async generateMd5(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Check if file exists at path
   */
  async fileExists(filePath: string): Promise<boolean> {
    return fs.existsSync(filePath);
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
}

export const imageService = new ImageService();
