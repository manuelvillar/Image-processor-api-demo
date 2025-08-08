// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the image_processor database
db = db.getSiblingDB('image_processor');

// Create collections with validation
db.createCollection('tasks', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['taskId', 'status', 'price', 'originalPath', 'createdAt'],
      properties: {
        taskId: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        status: {
          enum: ['pending', 'completed', 'failed'],
          description: 'must be one of: pending, completed, failed'
        },
        price: {
          bsonType: 'number',
          minimum: 5,
          maximum: 50,
          description: 'must be a number between 5 and 50'
        },
        originalPath: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date and is required'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'must be a date'
        },
        completedAt: {
          bsonType: 'date',
          description: 'must be a date'
        },
        error: {
          bsonType: 'string',
          description: 'must be a string'
        },
        images: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['resolution', 'path', 'md5', 'createdAt'],
            properties: {
              resolution: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              path: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              md5: {
                bsonType: 'string',
                description: 'must be a string and is required'
              },
              createdAt: {
                bsonType: 'date',
                description: 'must be a date and is required'
              }
            }
          }
        }
      }
    }
  }
});

db.createCollection('images', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['taskId', 'resolution', 'path', 'md5', 'createdAt'],
      properties: {
        taskId: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        resolution: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        path: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        md5: {
          bsonType: 'string',
          description: 'must be a string and is required'
        },
        createdAt: {
          bsonType: 'date',
          description: 'must be a date and is required'
        }
      }
    }
  }
});

// Create indexes for efficient queries
db.tasks.createIndex({ taskId: 1 }, { unique: true });
db.tasks.createIndex({ status: 1, createdAt: -1 });
db.tasks.createIndex({ createdAt: -1 });

db.images.createIndex({ taskId: 1 });
db.images.createIndex({ md5: 1 });
db.images.createIndex({ resolution: 1 });
db.images.createIndex({ createdAt: -1 });

// Create a compound index for efficient task queries
db.images.createIndex({ taskId: 1, resolution: 1 });

// Insert sample data for development and testing
print('Inserting sample data...');

// Sample completed task
db.tasks.insertOne({
  taskId: "sample-task-1",
  status: "completed",
  price: 25.5,
  originalPath: "/input/sample-image.jpg",
  createdAt: new Date("2024-06-01T12:00:00Z"),
  updatedAt: new Date("2024-06-01T12:10:00Z"),
  completedAt: new Date("2024-06-01T12:10:00Z"),
  images: [
    {
      resolution: "1024",
      path: "/output/sample-image/1024/f322b730b287da77e1c519c7ffef4fc2.jpg",
      md5: "f322b730b287da77e1c519c7ffef4fc2",
      createdAt: new Date("2024-06-01T12:05:00Z")
    },
    {
      resolution: "800",
      path: "/output/sample-image/800/202fd8b3174a774bac24428e8cb230a1.jpg",
      md5: "202fd8b3174a774bac24428e8cb230a1",
      createdAt: new Date("2024-06-01T12:05:00Z")
    }
  ]
});

// Sample pending task
db.tasks.insertOne({
  taskId: "sample-task-2",
  status: "pending",
  price: 18.75,
  originalPath: "/input/pending-image.png",
  createdAt: new Date("2024-06-01T13:00:00Z"),
  updatedAt: new Date("2024-06-01T13:00:00Z")
});

// Sample failed task
db.tasks.insertOne({
  taskId: "sample-task-3",
  status: "failed",
  price: 32.0,
  originalPath: "/input/failed-image.jpg",
  createdAt: new Date("2024-06-01T14:00:00Z"),
  updatedAt: new Date("2024-06-01T14:05:00Z"),
  error: "Image file not found or invalid format"
});

// Insert corresponding image records
db.images.insertMany([
  {
    taskId: "sample-task-1",
    resolution: "1024",
    path: "/output/sample-image/1024/f322b730b287da77e1c519c7ffef4fc2.jpg",
    md5: "f322b730b287da77e1c519c7ffef4fc2",
    createdAt: new Date("2024-06-01T12:05:00Z")
  },
  {
    taskId: "sample-task-1",
    resolution: "800",
    path: "/output/sample-image/800/202fd8b3174a774bac24428e8cb230a1.jpg",
    md5: "202fd8b3174a774bac24428e8cb230a1",
    createdAt: new Date("2024-06-01T12:05:00Z")
  }
]);

print('MongoDB initialization completed successfully!');
print('Database: image_processor');
print('Collections: tasks, images');
print('Indexes created for efficient querying');
print('Sample data inserted:');
print('- 3 tasks (completed, pending, failed)');
print('- 2 image records for completed task'); 