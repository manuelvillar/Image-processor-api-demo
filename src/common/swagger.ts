import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processor API',
      version: '1.0.0',
      description: 'A REST API for image processing tasks with MongoDB persistence',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Unique identifier for the task',
              example: 'task_20250811115246_ipgdc3',
            },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed'],
              description: 'Current status of the task',
              example: 'pending',
            },
            price: {
              type: 'number',
              minimum: 5,
              maximum: 50,
              description: 'Random price assigned to the task (5-50)',
              example: 25.5,
            },
            originalPath: {
              type: 'string',
              description: 'Path to the original image file',
              example: '/input/image.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation timestamp',
              example: '2025-08-11T11:52:46.174Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-08-11T11:52:48.532Z',
            },
            completedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task completion timestamp (if completed)',
              example: '2025-08-11T11:52:48.532Z',
            },
            error: {
              type: 'string',
              description: 'Error message (if task failed)',
              example: 'Failed to download file from URL: Not Found',
            },
            images: {
              type: 'array',
              description: 'Generated image variants (if completed)',
              items: {
                $ref: '#/components/schemas/ImageVariant',
              },
            },
          },
          required: ['taskId', 'status', 'price'],
        },
        ImageVariant: {
          type: 'object',
          properties: {
            resolution: {
              type: 'string',
              description: 'Image resolution',
              example: '1024',
            },
            path: {
              type: 'string',
              description: 'Path to the generated image',
              example: '/output/image/1024/f322b730b287da77e1c519c7ffef4fc2.jpg',
            },
            md5: {
              type: 'string',
              description: 'MD5 hash of the image file',
              example: 'f322b730b287da77e1c519c7ffef4fc2',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Image creation timestamp',
              example: '2025-08-11T11:52:48.532Z',
            },
          },
          required: ['resolution', 'path', 'md5', 'createdAt'],
        },
        CreateTaskRequest: {
          type: 'object',
          properties: {
            imageUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL of the image to process',
              example: 'https://example.com/image.jpg',
            },
            imageFile: {
              type: 'string',
              description: 'Base64 encoded image file',
              example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
            },
          },
          oneOf: [
            { required: ['imageUrl'] },
            { required: ['imageFile'] },
          ],
          description: 'Either imageUrl or imageFile must be provided',
        },
        CreateTaskResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                taskId: {
                  type: 'string',
                  example: 'task_20250811115246_ipgdc3',
                },
                status: {
                  type: 'string',
                  example: 'pending',
                },
                price: {
                  type: 'number',
                  example: 25.5,
                },
                message: {
                  type: 'string',
                  example: 'Task created successfully. Image processing started.',
                },
              },
            },
          },
        },
        GetTaskResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              $ref: '#/components/schemas/Task',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Not Found',
            },
            message: {
              type: 'string',
              example: 'Task not found: task_123',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'imageUrl',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid URL format',
                  },
                },
              },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-08-11T11:52:46.174Z',
            },
            uptime: {
              type: 'number',
              example: 138.925530083,
            },
            services: {
              type: 'object',
              properties: {
                server: {
                  type: 'string',
                  example: 'ok',
                },
                database: {
                  type: 'string',
                  example: 'ok',
                },
              },
            },
          },
        },
      },
      responses: {
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
export const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Image Processor API Documentation',
};
