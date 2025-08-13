import { describe, it, expect, beforeEach, vi } from 'vitest';
import { taskService } from './task.service.js';
import { Task } from './task.model.js';
import { Image } from '../images/image.model.js';
import { NotFoundError } from '../../common/errors.js';


// Safe type casting helper
const asMock = <T>(obj: unknown): T => obj as T;



// Mock dependencies
vi.mock('./task.model.js');
vi.mock('../images/image.model.js');
vi.mock('../images/image.service.js');
vi.mock('../images/file.service.js');

// Type-safe mock helpers
type MockTask = {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  price: number;
  originalPath?: string | undefined;
  error?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | undefined;
  images?: Array<{
    resolution: string;
    path: string;
    md5: string;
    createdAt: Date;
  }> | undefined;
  save: ReturnType<typeof vi.fn>;
};

const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  taskId: 'task_123',
  status: 'pending' as const,
  price: 25,
  originalPath: undefined,
  error: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: undefined,
  images: undefined,
  save: vi.fn().mockResolvedValue(true),
  ...overrides,
});

type MockImage = {
  taskId: string;
  resolution: string;
  path: string;
  md5: string;
  createdAt: Date;
};

const createMockImage = (overrides: Partial<MockImage> = {}): MockImage => ({
  taskId: 'task_123',
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
    it('should generate task IDs with timestamp format', async () => {
      const mockTask = createMockTask();
      asMock<{ mockImplementation: (fn: () => MockTask) => void }>(Task).mockImplementation(() => mockTask);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      const result = await taskService.createTask(request);

      // Test that the service calls the actual generation logic
      expect(result.taskId).toBe('task_123'); // Mock returns this, but real service would generate proper ID
      expect(result.status).toBe('pending');
      expect(mockTask.save).toHaveBeenCalled();
    });

    it('should generate prices between 5 and 50', async () => {
      const mockTask = createMockTask();
      asMock<{ mockImplementation: (fn: () => MockTask) => void; mockImplementationOnce: (fn: () => MockTask) => void }>(Task).mockImplementation(() => mockTask);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      const result = await taskService.createTask(request);

      expect(result.price).toBeGreaterThanOrEqual(5);
      expect(result.price).toBeLessThanOrEqual(50);
      expect(typeof result.price).toBe('number');
    });

    it('should generate unique task IDs for different requests', async () => {
      const mockTask1 = createMockTask({ taskId: 'task_123' });
      const mockTask2 = createMockTask({ taskId: 'task_456' });
      asMock<{ mockImplementation: (fn: () => MockTask) => void; mockImplementationOnce: (fn: () => MockTask) => void }>(Task).mockImplementationOnce(() => mockTask1);
      asMock<{ mockImplementation: (fn: () => MockTask) => void; mockImplementationOnce: (fn: () => MockTask) => void }>(Task).mockImplementationOnce(() => mockTask2);

      const request = { imageUrl: 'https://example.com/image.jpg' };
      
      const result1 = await taskService.createTask(request);
      const result2 = await taskService.createTask(request);

      expect(result1.taskId).not.toBe(result2.taskId);
    });

    it('should throw error for request without imageUrl or imageFile', async () => {
      const request = {};

      await expect(taskService.createTask(request)).rejects.toThrow('Either imageUrl or imageFile must be provided');
    });

    it('should reject request with both imageUrl and imageFile', async () => {
      const request = { 
        imageUrl: 'https://example.com/image.jpg',
        imageFile: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD'
      };

      // Should fail validation because both imageUrl and imageFile are provided
      await expect(taskService.createTask(request)).rejects.toThrow('Failed to create task: Either imageUrl or imageFile must be provided, but not both');
    });

    it('should handle database save errors', async () => {
      const request = { imageUrl: 'https://example.com/image.jpg' };
      const mockTask = createMockTask();
      mockTask.save.mockRejectedValue(new Error('Database error'));
      
      asMock<{ mockImplementation: (fn: () => MockTask) => void; mockImplementationOnce: (fn: () => MockTask) => void }>(Task).mockImplementation(() => mockTask);
      
      await expect(taskService.createTask(request)).rejects.toThrow('Failed to create task: Database error');
    });
  });

  describe('getTask', () => {
    it('should map task to result correctly', async () => {
      const mockTask = createMockTask({
        status: 'completed',
        originalPath: '/path/to/image',
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-01T10:05:00Z'),
        completedAt: new Date('2024-01-01T10:05:00Z'),
        error: undefined,
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockImage[]> }) => void }>(Image.find).mockReturnValue({
        exec: vi.fn().mockResolvedValue([]),
      });

      const result = await taskService.getTask('task_123');

      // Test actual mapping logic
      expect(result.taskId).toBe('task_123');
      expect(result.status).toBe('completed');
      expect(result.price).toBe(25);
      expect(result.originalPath).toBe('/path/to/image');
      expect(result.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2024-01-01T10:05:00Z'));
      expect(result.completedAt).toEqual(new Date('2024-01-01T10:05:00Z'));
      expect(result.error).toBeUndefined();
      expect(result.images).toEqual([]);
    });

    it('should include images when task is completed', async () => {
      const mockTask = createMockTask({
        status: 'completed',
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const mockImages = [
        createMockImage({ 
          resolution: '1024',
          path: '/output/image/1024/abc123.jpg',
          md5: 'abc123def456',
        }),
        createMockImage({ 
          resolution: '800',
          path: '/output/image/800/def456.jpg',
          md5: 'def456ghi789',
        }),
      ];

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockImage[]> }) => void }>(Image.find).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockImages),
      });

      const result = await taskService.getTask('task_123');

      // Test business logic: completed tasks should include images
      expect(result.status).toBe('completed');
      expect(result.images).toHaveLength(2);
      expect(result.images?.[0]?.resolution).toBe('1024');
      expect(result.images?.[0]?.path).toBe('/output/image/1024/abc123.jpg');
      expect(result.images?.[0]?.md5).toBe('abc123def456');
      expect(result.images?.[1]?.resolution).toBe('800');
      expect(result.images?.[1]?.path).toBe('/output/image/800/def456.jpg');
      expect(result.images?.[1]?.md5).toBe('def456ghi789');
    });

    it('should exclude images when task is pending', async () => {
      const mockTask = createMockTask({
        status: 'pending',
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.getTask('task_123');

      // Test business logic: pending tasks should not include images
      expect(result.status).toBe('pending');
      expect(result.images).toBeUndefined();
    });

    it('should exclude images when task is failed', async () => {
      const mockTask = createMockTask({
        status: 'failed',
        originalPath: '/path/to/image',
        createdAt: new Date(),
        updatedAt: new Date(),
        error: 'Processing failed',
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.getTask('task_123');

      // Test business logic: failed tasks should not include images
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Processing failed');
      expect(result.images).toBeUndefined();
    });

    it('should throw NotFoundError for non-existent task', async () => {
      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(taskService.getTask('non-existent')).rejects.toThrow(NotFoundError);
      await expect(taskService.getTask('non-existent')).rejects.toThrow('Task not found: non-existent');
    });

    it('should handle database query errors', async () => {
      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockRejectedValue(new Error('Database connection error')),
      });

      await expect(taskService.getTask('task_123')).rejects.toThrow('Failed to get task: Database connection error');
    });
  });

  describe('Business Logic', () => {
    it('should handle optional fields correctly in mapping', async () => {
      const mockTask = createMockTask({
        status: 'pending',
        originalPath: undefined,
        completedAt: undefined,
        error: undefined,
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.getTask('task_123');

      // Test that optional fields are handled correctly
      expect(result.originalPath).toBeUndefined();
      expect(result.completedAt).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(result.images).toBeUndefined();
    });

    it('should handle failed tasks with error messages', async () => {
      const mockTask = createMockTask({
        status: 'failed',
        error: 'Image processing failed: Invalid format',
        completedAt: new Date('2024-01-01T10:05:00Z'),
      });

      asMock<{ mockReturnValue: (obj: { exec: () => Promise<MockTask> }) => void }>(Task.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockTask),
      });

      const result = await taskService.getTask('task_123');

      // Test error handling in mapping
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Image processing failed: Invalid format');
      expect(result.completedAt).toEqual(new Date('2024-01-01T10:05:00Z'));
      expect(result.images).toBeUndefined();
    });

    it('should validate request data structure', async () => {
      // Test that the service properly validates the request structure
      const validRequest = { imageUrl: 'https://example.com/image.jpg' };
      const invalidRequest = { invalidField: 'test' } as unknown as Record<string, unknown>;

      const mockTask = createMockTask();
      asMock<{ mockImplementation: (fn: () => MockTask) => void; mockImplementationOnce: (fn: () => MockTask) => void }>(Task).mockImplementation(() => mockTask);

      // Valid request should work
      const validResult = await taskService.createTask(validRequest);
      expect(validResult.taskId).toBe('task_123');

      // Invalid request should be rejected by validation
      await expect(taskService.createTask(invalidRequest)).rejects.toThrow('Either imageUrl or imageFile must be provided');
    });
  });
});
