import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createApp, AppConfig } from '../../app.js';
import { appConfig } from '../../config/index.js';
import { mongoConnection } from '../../infra/mongo.js';

// Create test configuration with logger
const testConfig: AppConfig = {
  port: appConfig.port,
  logger: pino({ level: 'silent' }), // Silent logger for tests
};

// Create test app instance
const app = createApp(testConfig);

describe('Image Processor API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure MongoDB is connected
    await mongoConnection.connect();
  });

  afterAll(async () => {
    // Clean up MongoDB connection
    await mongoConnection.disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    const { Task } = await import('../../modules/tasks/task.model.js');
    const { Image } = await import('../../modules/images/image.model.js');
    await Task.deleteMany({});
    await Image.deleteMany({});
  });

  describe('Health Check', () => {
    it('should return health status with MongoDB connection', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: {
          server: 'ok',
          database: 'ok',
        },
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });
  });

  describe('API Documentation', () => {
    it('should serve OpenAPI JSON specification', async () => {
      const response = await request(app)
        .get('/api-docs.json')
        .expect(200);

      expect(response.body).toMatchObject({
        openapi: '3.0.0',
        info: {
          title: 'Image Processor API',
          version: '1.0.0',
        },
        paths: expect.objectContaining({
          '/health': expect.any(Object),
          '/tasks': expect.any(Object),
          '/tasks/{taskId}': expect.any(Object),
        }),
      });
    });

    it('should serve Swagger UI', async () => {
      await request(app)
        .get('/api-docs')
        .expect(301); // Swagger UI redirects

      // Follow the redirect
      const redirectResponse = await request(app)
        .get('/api-docs/')
        .expect(200);

      expect(redirectResponse.text).toContain('<!DOCTYPE html>');
      expect(redirectResponse.text).toContain('Image Processor API Documentation');
    });
  });

  describe('Task Creation', () => {
    it('should create a task with valid imageUrl', async () => {
      const taskData = {
        imageUrl: 'https://httpbin.org/image/jpeg',
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          taskId: expect.stringMatching(/^task_\d{14}_[a-z0-9]{6}$/),
          status: 'pending',
          price: expect.any(Number),
          message: 'Task created successfully. Image processing started.',
        },
      });

      // Verify price is within range
      expect(response.body.data.price).toBeGreaterThanOrEqual(5);
      expect(response.body.data.price).toBeLessThanOrEqual(50);
    });

    it('should create a task with valid imageFile (base64)', async () => {
      // Create a minimal valid JPEG base64 string
      const minimalJpeg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      
      const taskData = {
        imageFile: minimalJpeg,
      };

      const response = await request(app)
        .post('/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          taskId: expect.stringMatching(/^task_\d{14}_[a-z0-9]{6}$/),
          status: 'pending',
          price: expect.any(Number),
          message: 'Task created successfully. Image processing started.',
        },
      });
    });

    it('should reject task creation without imageUrl or imageFile', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.stringContaining('Either imageUrl or imageFile must be provided'),
          }),
        ]),
      });
    });

    it('should reject task creation with invalid imageUrl', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ imageUrl: 'not-a-valid-url' })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'imageUrl',
            message: expect.stringContaining('Invalid URL'),
          }),
        ]),
      });
    });

    it('should reject task creation with both imageUrl and imageFile', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({
          imageUrl: 'https://example.com/image.jpg',
          imageFile: 'data:image/jpeg;base64,test',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation Error',
        message: 'Invalid request data',
      });
    });
  });

  describe('Task Retrieval', () => {
    it('should retrieve a pending task', async () => {
      // First create a task
      const createResponse = await request(app)
        .post('/tasks')
        .send({ imageUrl: 'https://httpbin.org/image/jpeg' })
        .expect(201);

      const taskId = createResponse.body.data.taskId;

      // Then retrieve it
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          taskId,
          status: 'pending',
          price: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      });

      // Pending tasks should not have images
      expect(response.body.data.images).toBeUndefined();
      expect(response.body.data.completedAt).toBeUndefined();
      expect(response.body.data.error).toBeUndefined();
    });

    it('should retrieve a completed task with images', async () => {
      // Create a task and wait for it to complete (or simulate completion)
      const createResponse = await request(app)
        .post('/tasks')
        .send({ imageUrl: 'https://httpbin.org/image/jpeg' })
        .expect(201);

      const taskId = createResponse.body.data.taskId;

      // Simulate task completion by updating the database directly
      const { Task } = await import('../../modules/tasks/task.model.js');
      const { Image } = await import('../../modules/images/image.model.js');
      
      await Task.findOneAndUpdate(
        { taskId },
        {
          status: 'completed',
          originalPath: '/input/test-image.jpg',
          completedAt: new Date(),
        }
      );

      // Add some test images
      await Image.insertMany([
        {
          taskId,
          resolution: '1024',
          path: '/output/test-image/1024/abc123.jpg',
          md5: 'abc123def456',
          createdAt: new Date(),
        },
        {
          taskId,
          resolution: '800',
          path: '/output/test-image/800/def456.jpg',
          md5: 'def456ghi789',
          createdAt: new Date(),
        },
      ]);

      // Retrieve the completed task
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          taskId,
          status: 'completed',
          price: expect.any(Number),
          originalPath: '/input/test-image.jpg',
          completedAt: expect.any(String),
          images: expect.arrayContaining([
            expect.objectContaining({
              resolution: '1024',
              path: '/output/test-image/1024/abc123.jpg',
              md5: 'abc123def456',
            }),
            expect.objectContaining({
              resolution: '800',
              path: '/output/test-image/800/def456.jpg',
              md5: 'def456ghi789',
            }),
          ]),
        },
      });

      expect(response.body.data.images).toHaveLength(2);
    });

    it('should retrieve a failed task with error message', async () => {
      // Create a task
      const createResponse = await request(app)
        .post('/tasks')
        .send({ imageUrl: 'https://httpbin.org/image/jpeg' })
        .expect(201);

      const taskId = createResponse.body.data.taskId;

      // Simulate task failure
      const { Task } = await import('../../modules/tasks/task.model.js');
      
      await Task.findOneAndUpdate(
        { taskId },
        {
          status: 'failed',
          error: 'Failed to download file from URL: Not Found',
          completedAt: new Date(),
        }
      );

      // Retrieve the failed task
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          taskId,
          status: 'failed',
          price: expect.any(Number),
          error: 'Failed to download file from URL: Not Found',
          completedAt: expect.any(String),
        },
      });

      // Failed tasks should not have images
      expect(response.body.data.images).toBeUndefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/tasks/non-existent-task-id')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Task not found: non-existent-task-id not found',
      });
    });

    it('should return 400 for missing task ID', async () => {
      const response = await request(app)
        .get('/tasks/')
        .expect(404); // Express will treat this as a route not found

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: expect.stringContaining('Route GET /tasks/ not found'),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Bad Request',
        message: 'Invalid JSON format',
      });
    });

    it('should handle requests to non-existent endpoints', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: expect.stringContaining('Route GET /non-existent-endpoint not found'),
      });
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .put('/tasks')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: expect.stringContaining('Route PUT /tasks not found'),
      });
    });
  });
});
