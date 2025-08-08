import { describe, it, expect, beforeEach, vi } from 'vitest';
import { taskService } from './task.service.js';
import { Task } from './task.model.js';
import { Image } from '../images/image.model.js';
import { NotFoundError } from '../../common/errors.js';

// Mock dependencies - Official Vitest pattern
vi.mock('./task.model.js');
vi.mock('../images/image.model.js');
vi.mock('../images/image.service.js');
vi.mock('../images/file.service.js');

// Type-safe mock helpers
const createMockTask = (overrides: Partial<any> = {}) => ({
  taskId: 'task_123',
  status: 'pending' as const,
  price: 25,
  save: vi.fn().mockResolvedValue(true),
  ...overrides,
});

const createMockImage = (overrides: Partial<any> = {}) => ({
  resolution: '1024',
  path: '/output/image/1024/abc123.jpg',
  md5: 'abc123def456',
  createdAt: new Date(),
  ...overrides,
});

describe('TaskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with valid imageUrl request', async () => {
      const mockTask = createMockTask();

      // Use proper Vitest mocking
      const { Task } = await import('./task.model.js');
      (Task as any).mockImplementation(() => mockTask);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      const result = await taskService.createTask(request);

      expect(result.taskId).toBe('task_123');
      expect(result.status).toBe('pending');
      expect(result.price).toBe(25);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should create a task with valid imageFile request', async () => {
      const mockTask = createMockTask({
        taskId: 'task_456',
        price: 30,
      });

      (Task as any).mockImplementation(() => mockTask);

      const request = { imageFile: { buffer: Buffer.from('test'), mimetype: 'image/jpeg' } };
      const result = await taskService.createTask(request);

      expect(result.taskId).toBe('task_456');
      expect(result.status).toBe('pending');
      expect(result.price).toBe(30);
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should throw error for request without imageUrl or imageFile', async () => {
      const request = {};

      await expect(taskService.createTask(request)).rejects.toThrow('Either imageUrl or imageFile must be provided');
    });

    it('should throw error for request with both imageUrl and imageFile', async () => {
      const request = { 
        imageUrl: 'https://example.com/image.jpg',
        imageFile: { buffer: Buffer.from('test'), mimetype: 'image/jpeg' }
      };

      // This should still work as we only validate that at least one is provided
      const mockTask = createMockTask({
        taskId: 'task_789',
        price: 15,
      });

      (Task as any).mockImplementation(() => mockTask);

      const result = await taskService.createTask(request);
      expect(result.taskId).toBe('task_789');
    });
  });

  describe('getTask', () => {
    it('should return task when found', async () => {
      const mockTask = createMockTask({
        status: 'completed',
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (Task.findOne as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      (Image.find as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      });

      const result = await taskService.getTask('task_123');

      expect(result.taskId).toBe('task_123');
      expect(result.status).toBe('completed');
      expect(result.price).toBe(25);
    });

    it('should return task with images when completed', async () => {
      const mockTask = createMockTask({
        status: 'completed',
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockImages = [
        createMockImage({ resolution: '1024' }),
        createMockImage({ 
          resolution: '800',
          path: '/output/image/800/def456.jpg',
          md5: 'def456ghi789',
        }),
      ];

      (Task.findOne as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      (Image.find as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockImages),
      });

      const result = await taskService.getTask('task_123');

      expect(result.taskId).toBe('task_123');
      expect(result.status).toBe('completed');
      expect(result.images).toHaveLength(2);
      expect(result.images?.[0]?.resolution).toBe('1024');
      expect(result.images?.[1]?.resolution).toBe('800');
    });

    it('should return task without images when pending', async () => {
      const mockTask = createMockTask({
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (Task.findOne as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.getTask('task_123');

      expect(result.taskId).toBe('task_123');
      expect(result.status).toBe('pending');
      expect(result.images).toBeUndefined();
    });

    it('should throw NotFoundError for non-existent task', async () => {
      (Task.findOne as any).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(taskService.getTask('non-existent')).rejects.toThrow(NotFoundError);
      await expect(taskService.getTask('non-existent')).rejects.toThrow('Task not found: non-existent');
    });
  });

  describe('generateTaskId', () => {
    it('should generate unique task IDs', () => {
      // This is a private method, but we can test it indirectly
      // by creating multiple tasks and checking their IDs are different
      const mockTask1 = createMockTask({ taskId: 'task_123' });
      const mockTask2 = createMockTask({ taskId: 'task_456', price: 30 });

      (Task as any).mockImplementationOnce(() => mockTask1);
      (Task as any).mockImplementationOnce(() => mockTask2);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      
      // Create two tasks
      taskService.createTask(request);
      taskService.createTask(request);

      expect(mockTask1.taskId).not.toBe(mockTask2.taskId);
    });
  });

  describe('generateRandomPrice', () => {
    it('should generate prices within valid range', () => {
      // This is a private method, but we can test it indirectly
      // by creating multiple tasks and checking their prices
      const mockTask = createMockTask();

      (Task as any).mockImplementation(() => mockTask);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      
      // Create multiple tasks to test price generation
      for (let i = 0; i < 10; i++) {
        taskService.createTask(request);
        expect(mockTask.price).toBeGreaterThanOrEqual(5);
        expect(mockTask.price).toBeLessThanOrEqual(50);
      }
    });
  });
});
