import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { TaskController } from './task.controller.js';
import { TaskService } from './task.service.js';


// Mock the task service
vi.mock('./task.service.js');

describe('TaskController', () => {
  let controller: TaskController;
  let mockTaskService: {
    createTask: ReturnType<typeof vi.fn>;
    getTask: ReturnType<typeof vi.fn>;
  };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock task service
    mockTaskService = {
      createTask: vi.fn(),
      getTask: vi.fn(),
    };

    // Create controller instance
    controller = new TaskController(mockTaskService as unknown as TaskService);

    // Create mock Express objects
    mockRequest = {
      body: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      // Arrange
      const mockTask = {
        taskId: 'task_123',
        status: 'pending',
        price: 25,
        originalPath: '/tmp/test.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const requestBody = {
        imageUrl: 'https://example.com/image.jpg',
      };

      mockRequest.body = requestBody;
      mockTaskService.createTask.mockResolvedValue(mockTask);

      // Act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockTaskService.createTask).toHaveBeenCalledWith(requestBody);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          taskId: 'task_123',
          status: 'pending',
          price: 25,
          message: 'Task created successfully. Image processing started.',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Arrange
      const requestBody = { invalidField: 'test' };
      mockRequest.body = requestBody;

      // Act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid request data',
          code: 'VALIDATION_ERROR',
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      const requestBody = { imageUrl: 'https://example.com/image.jpg' };
      mockRequest.body = requestBody;
      mockTaskService.createTask.mockRejectedValue(serviceError);

      // Act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('getTask', () => {
    it('should get a task successfully', async () => {
      // Arrange
      const mockTask = {
        taskId: 'task_123',
        status: 'completed',
        price: 25,
        originalPath: '/tmp/test.jpg',
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [
          {
            taskId: 'task_123',
            resolution: '1024',
            path: '/output/test_1024.jpg',
            md5: 'abc123',
            createdAt: new Date(),
          },
        ],
      };

      mockRequest.params = { taskId: 'task_123' };
      mockTaskService.getTask.mockResolvedValue(mockTask);

      // Act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockTaskService.getTask).toHaveBeenCalledWith('task_123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockTask,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing task ID', async () => {
      // Arrange
      mockRequest.params = {};

      // Act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Task ID is required',
          code: 'VALIDATION_ERROR',
        })
      );
      expect(mockTaskService.getTask).not.toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle task not found', async () => {
      // Arrange
      mockRequest.params = { taskId: 'task_123' };
      mockTaskService.getTask.mockResolvedValue(null);

      // Act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockTaskService.getTask).toHaveBeenCalledWith('task_123');
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Task with ID task_123 with id task_123 not found',
          code: 'NOT_FOUND',
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      mockRequest.params = { taskId: 'task_123' };
      mockTaskService.getTask.mockRejectedValue(serviceError);

      // Act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });
});
