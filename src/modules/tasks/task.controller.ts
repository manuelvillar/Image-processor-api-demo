import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service.js';
import { CreateTaskRequestSchema } from '../../common/validation.js';
import { ValidationError, NotFoundError } from '../../common/errors.js';
import { ZodError } from 'zod';

export class TaskController {
  private taskService: TaskService;

  constructor(taskService: TaskService) {
    this.taskService = taskService;
  }

  /**
   * Create a new image processing task
   * POST /tasks
   */
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body using Zod schema
      const validatedData = CreateTaskRequestSchema.parse(req.body);
      
      // Create task using service
      const task = await this.taskService.createTask(validatedData);
      
      // Return 201 Created with task details
      res.status(201).json({
        success: true,
        data: {
          taskId: task.taskId,
          status: task.status,
          price: task.price,
          message: 'Task created successfully. Image processing started.'
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Convert ZodError to ValidationError
        const validationError = new ValidationError(
          'Invalid request data',
          error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
        next(validationError);
        return;
      }
      next(error);
    }
  }

  /**
   * Get task status and results by ID
   * GET /tasks/:taskId
   */
  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;
      
      if (!taskId) {
        throw new ValidationError('Task ID is required');
      }

      // Get task using service
      const task = await this.taskService.getTask(taskId);
      
      if (!task) {
        throw new NotFoundError(`Task with ID ${taskId}`, taskId);
      }

      // Return 200 OK with task details
      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
}
