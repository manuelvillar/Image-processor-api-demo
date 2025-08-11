# Image Processor API

A REST API for image processing tasks with MongoDB persistence, built with Node.js, TypeScript, and Express.

## Problem Statement

Build a REST API that:
1. Accepts image processing tasks (POST /tasks)
2. Processes images to generate variants at 1024px and 800px width
3. Provides task status and results (GET /tasks/:id)
4. Stores metadata in MongoDB with random pricing (5-50)

## Current Status

**✅ COMPLETED**: All core features implemented and tested.

### ✅ **Completed Features:**
- Express.js server with security middleware (helmet, cors, morgan)
- Health check endpoint (`GET /health`) with MongoDB status
- Centralized error handling and 404 responses
- TypeScript configuration with NodeNext ES modules
- Testing infrastructure with Vitest
- Code quality tools (ESLint, Prettier)
- Development environment with hot reload
- Production build system
- Docker Compose setup for MongoDB
- MongoDB connection with retry logic
- Configuration management with environment variables
- Database health monitoring
- Graceful shutdown with MongoDB disconnection
- Mongoose models for Tasks and Images
- Zod validation schemas for request validation
- Custom error classes for consistent error handling
- Type-safe database operations
- Sharp image processing with resizing and optimization
- File upload and URL download handling
- MD5 hashing for file integrity
- Image validation and size limits
- Comprehensive image processing tests
- Task service with business logic
- Task creation with validation
- Task retrieval by ID
- Asynchronous image processing
- Random price generation (5-50)
- Unique task ID generation
- Status management (pending → completed/failed)
- Comprehensive task service tests
- OpenAPI/Swagger documentation
- Interactive API documentation UI
- **Integration test framework with supertest**
- **Consolidated integration tests with functional separation**
- **Complete API endpoint testing**
- **Error handling and validation testing**

### 🎯 **API Endpoints Fully Implemented:**
- `GET /health` - Health check with MongoDB status
- `POST /tasks` - Create image processing tasks
- `GET /tasks/:id` - Retrieve task status and results
- `GET /api-docs` - Interactive API documentation
- `GET /api-docs.json` - OpenAPI specification

### 🧪 **Testing Coverage:**
- **Unit Tests**: 28 tests covering services, controllers, and utilities
- **Integration Tests**: 16 tests covering all API endpoints and scenarios
- **Total**: 44 tests with 100% pass rate

## Tech Stack

- **Node.js** + **TypeScript** (ES2022, NodeNext modules)
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **Sharp** for image processing
- **Vitest** for testing (ES module compatible)
- **ESLint** + **Prettier** for code quality
- **Pino** for structured logging
- **tsx** for development with hot reload
- **Docker** for MongoDB containerization
- **Swagger/OpenAPI** for API documentation

## Project Structure

```
src/
├── app.ts              # Express app factory with middleware
├── server.ts           # Server bootstrap and graceful shutdown
├── config/
│   └── index.ts        # Configuration management and validation
├── infra/
│   └── mongo.ts        # MongoDB connection and health monitoring
├── common/
│   ├── errors.ts       # Custom error classes and error handling
│   ├── validation.ts   # Zod validation schemas and middleware
│   └── swagger.ts      # OpenAPI/Swagger documentation setup
├── modules/
│   ├── tasks/
│   │   ├── task.model.ts      # Task Mongoose model and schema
│   │   ├── task.service.ts    # Task business logic and operations
│   │   ├── task.controller.ts # Task HTTP controller
│   │   ├── task.routes.ts     # Task API routes
│   │   ├── task.service.test.ts # Task service tests
│   │   └── task.controller.test.ts # Task controller tests
│   └── images/
│       ├── image.model.ts     # Image Mongoose model and schema
│       ├── image.service.ts   # Sharp image processing service
│       ├── file.service.ts    # File upload and download handling
│       └── image.service.test.ts # Image processing tests
└── test/
    ├── setup.ts        # Test configuration and global setup
    └── integration/
        └── integration.test.ts # Comprehensive integration tests
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start MongoDB with Docker:
   ```bash
   docker compose up -d
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Verify the server is running:
   ```bash
   curl http://localhost:3000/health
   ```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-08T10:16:30.492Z",
  "uptime": 138.925530083,
  "services": {
    "server": "ok",
    "database": "ok"
  }
}
```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload (tsx)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - TypeScript type checking

### Testing
- `npm test` - Run all tests (unit + integration)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:integration` - Run integration tests only

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## API Documentation

The API is fully documented with OpenAPI/Swagger:

- **Interactive Documentation**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs.json

### Health Check
- `GET /health` - Server health status with uptime

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-08T10:16:30.492Z",
  "uptime": 138.925530083,
  "services": {
    "server": "ok",
    "database": "ok"
  }
}
```

### Tasks API

#### Create Task
- `POST /tasks` - Create a new image processing task

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```
OR
```json
{
  "imageFile": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "taskId": "task_20250808101630_abc123",
    "status": "pending",
    "price": 25.5,
    "message": "Task created successfully. Image processing started."
  }
}
```

#### Get Task
- `GET /tasks/:taskId` - Get task status and results

**Response (Pending):**
```json
{
  "success": true,
  "data": {
    "taskId": "task_20250808101630_abc123",
    "status": "pending",
    "price": 25.5,
    "createdAt": "2025-08-08T10:16:30.492Z",
    "updatedAt": "2025-08-08T10:16:30.492Z"
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "taskId": "task_20250808101630_abc123",
    "status": "completed",
    "price": 25.5,
    "originalPath": "/input/image.jpg",
    "completedAt": "2025-08-08T10:16:35.123Z",
    "images": [
      {
        "resolution": "1024",
        "path": "/output/image/1024/abc123.jpg",
        "md5": "f322b730b287da77e1c519c7ffef4fc2",
        "createdAt": "2025-08-08T10:16:35.123Z"
      },
      {
        "resolution": "800",
        "path": "/output/image/800/def456.jpg",
        "md5": "a1b2c3d4e5f678901234567890123456",
        "createdAt": "2025-08-08T10:16:35.123Z"
      }
    ]
  }
}
```

**Response (Failed):**
```json
{
  "success": true,
  "data": {
    "taskId": "task_20250808101630_abc123",
    "status": "failed",
    "price": 25.5,
    "error": "Failed to download file from URL: Not Found",
    "completedAt": "2025-08-08T10:16:32.456Z"
  }
}
```

### Features:
- ✅ Task creation with validation (imageUrl OR imageFile)
- ✅ Task retrieval by ID with all statuses
- ✅ Asynchronous image processing
- ✅ Random price generation (5-50)
- ✅ Status management (pending → completed/failed)
- ✅ Error handling and cleanup
- ✅ OpenAPI documentation
- ✅ Image variants at 1024px and 800px width
- ✅ MD5 hashing for file integrity

## Environment Variables

Create a `.env` file with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# MongoDB Configuration
MONGO_URI=mongodb://admin:password@localhost:27017/image_processor?authSource=admin
MONGO_DB_NAME=image_processor

# File System Configuration
OUTPUT_DIR=./output
TMP_DIR=./temp

# Image Processing Configuration
MAX_DOWNLOAD_MB=25
```

## Testing

The project uses **Vitest** for testing with ES module support:

```bash
# Run all tests (unit + integration)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration
```

**Test Coverage:**
- ✅ **Unit Tests**: 28 tests covering services, controllers, and utilities
- ✅ **Integration Tests**: 16 tests covering all API endpoints
- ✅ **Total**: 44 tests with 100% pass rate

**Integration Test Categories:**
- Health Check endpoints
- API Documentation (OpenAPI/Swagger)
- Task Creation (valid/invalid scenarios)
- Task Retrieval (pending/completed/failed states)
- Error Handling (malformed requests, 404s, etc.)

## Code Quality

This project uses:

- **ESLint** with TypeScript support for code linting
- **Prettier** for consistent code formatting
- **TypeScript** with strict configuration for type safety
- **Vitest** for fast, ES module compatible testing

### Configuration Highlights

- **NodeNext** module resolution for production consistency
- **ES2022** target for modern JavaScript features
- **Strict TypeScript** configuration for maximum type safety
- **Vitest globals** included for test file type checking
- **ESLint** with TypeScript and Prettier integration

## Architecture Decisions

### Module System
- **NodeNext** for consistent ES module handling
- **Explicit .js extensions** in imports for production builds
- **Single TypeScript config** for all environments

### Testing Strategy
- **Vitest** over Jest for better ES module support
- **Consolidated integration tests** with functional separation
- **Test isolation** with proper setup/teardown
- **Comprehensive coverage** of all API endpoints

### Development Experience
- **tsx** for fast development with hot reload
- **Structured logging** with Pino
- **Security middleware** (helmet, cors, morgan)
- **Interactive API documentation** with Swagger UI

## License

ISC 