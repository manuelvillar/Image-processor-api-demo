import { Task } from './task.model.js';
import { Image } from '../images/image.model.js';
import { imageService } from '../images/image.service.js';
import { fileService } from '../images/file.service.js';
import { NotFoundError, ProcessingError, ValidationError } from '../../common/errors.js';
import type { CreateTaskRequest, TaskResult, ITask, IImage } from '../../types/index.js';

export class TaskService {
  /**
   * Create a new image processing task
   */
  async createTask(request: CreateTaskRequest): Promise<TaskResult> {
    try {
      // Validate request
      if (!request.imageUrl && !request.imageFile) {
        throw new ValidationError('Either imageUrl or imageFile must be provided');
      }
      
      if (request.imageUrl && request.imageFile) {
        throw new ValidationError('Either imageUrl or imageFile must be provided, but not both');
      }

      // Generate task ID and price
      const taskId = this.generateTaskId();
      const price = this.generateRandomPrice();

      // Create task record
      const taskData = {
        taskId,
        status: 'pending',
        price,
      };
      
      const task = new Task(taskData);
      await task.save();

      // Process image asynchronously
      this.processImageAsync(taskId, request).catch((error) => {
        console.error(`Task ${taskId} processing failed:`, error);
        this.markTaskAsFailed(taskId, error.message).catch(console.error);
      });

      return this.mapTaskToResult(task);
    } catch (error) {
      throw new ProcessingError(
        `Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<TaskResult> {
    try {
      const task = await Task.findOne({ taskId }).exec();
      
      if (!task) {
        throw new NotFoundError(`Task not found: ${taskId}`);
      }

      // Get associated images if task is completed
      let images: IImage[] = [];
      if (task.status === 'completed') {
        images = await Image.find({ taskId }).exec();
      }

      const result = this.mapTaskToResult(task, images);
      return result;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ProcessingError(
        `Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process image asynchronously
   */
  private async processImageAsync(taskId: string, request: CreateTaskRequest): Promise<void> {
    try {
      let sourcePath: string;
      let originalName: string;

      // Handle file upload or URL download
      if (request.imageFile) {
        const fileInfo = await fileService.saveBase64File(request.imageFile);
        sourcePath = fileInfo.path;
        originalName = fileInfo.name;
      } else if (request.imageUrl) {
        const fileInfo = await fileService.downloadFromUrl(request.imageUrl);
        sourcePath = fileInfo.path;
        originalName = fileInfo.name;
      } else {
        throw new ValidationError('No image source provided');
      }

      // Update task with original path
      await Task.findOneAndUpdate(
        { taskId },
        { originalPath: sourcePath },
        { new: true }
      ).exec();

      // Process image with Sharp
      const processedImages = await imageService.processImage(sourcePath, originalName);

      // Save processed images to database
      const imageDocuments = processedImages.map((img) => new Image({
        taskId,
        resolution: img.resolution,
        path: img.path,
        md5: img.md5,
        createdAt: new Date(),
      }));

      await Image.insertMany(imageDocuments);

      // Mark task as completed
      await this.markTaskAsCompleted(taskId);

      // Cleanup temporary file
      await fileService.cleanupTempFile(sourcePath);

    } catch (error) {
      // Cleanup temporary file on error
      if (request.imageFile || request.imageUrl) {
        try {
          const fileInfo = request.imageFile 
            ? await fileService.saveBase64File(request.imageFile)
            : await fileService.downloadFromUrl(request.imageUrl!);
          await fileService.cleanupTempFile(fileInfo.path);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Mark task as completed
   */
  private async markTaskAsCompleted(taskId: string): Promise<void> {
    await Task.findOneAndUpdate(
      { taskId },
      {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      }
    ).exec();
  }

  /**
   * Mark task as failed
   */
  private async markTaskAsFailed(taskId: string, error: string): Promise<void> {
    await Task.findOneAndUpdate(
      { taskId },
      {
        status: 'failed',
        error,
        updatedAt: new Date(),
      }
    ).exec();
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    const dateStr = date.toISOString().slice(0, 19).replace(/[-:T]/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `task_${dateStr}_${random}`;
  }

  /**
   * Generate random price between 5 and 50
   */
  private generateRandomPrice(): number {
    return Math.floor(Math.random() * 46) + 5; // 5 to 50 inclusive
  }

  /**
   * Map task document to result interface
   */
  private mapTaskToResult(task: ITask, images: IImage[] = []): TaskResult {
    return {
      taskId: task.taskId,
      status: task.status,
      price: task.price,
      originalPath: task.originalPath,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt || undefined,
      error: task.error || undefined,
      images: task.status === 'completed' ? images.map(img => ({
        resolution: img.resolution as '1024' | '800',
        path: img.path,
        md5: img.md5,
        createdAt: img.createdAt,
      })) : undefined,
    };
  }
}

export const taskService = new TaskService();
