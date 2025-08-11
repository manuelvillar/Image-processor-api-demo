# Image Processor API

A REST API for image processing tasks with MongoDB persistence, built with Node.js, TypeScript, and Express.

## Problem Statement

Build a REST API that:
1. Accepts image processing tasks (POST /tasks)
2. Processes images to generate variants at 1024px and 800px width
3. Provides task status and results (GET /tasks/:id)
4. Stores metadata in MongoDB with random pricing (5-50)

## Current Status

**Step 5 Complete**: API documentation with OpenAPI/Swagger.

✅ **Completed Features:**
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
- **NEW**: Task service with business logic
- **NEW**: Task creation with validation
- **NEW**: Task retrieval by ID
- **NEW**: Asynchronous image processing
- **NEW**: Random price generation (5-50)
- **NEW**: Unique task ID generation
- **NEW**: Status management (pending → completed/failed)
- **NEW**: Comprehensive task service tests
- **NEW**: OpenAPI/Swagger documentation
- **NEW**: Interactive API documentation UI

🔄 **Next Steps:**
- Step 6: Integration testing with real data
- Step 7: File upload functionality
- Step 8: Production deployment setup

## Tech Stack

- **Node.js** + **TypeScript** (ES2022, NodeNext modules)
- **Express.js** web framework
- **MongoDB** with Mongoose ODM
- **Vitest** for testing (ES module compatible)
- **ESLint** + **Prettier** for code quality
- **Pino** for structured logging
- **tsx** for development with hot reload
- **Docker** for MongoDB containerization

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
│   └── validation.ts   # Zod validation schemas and middleware
├── modules/
│   ├── tasks/
│   │   ├── task.model.ts # Task Mongoose model and schema
│   │   ├── task.service.ts # Task business logic and operations
│   │   └── task.service.test.ts # Task service tests
│   └── images/
│       ├── image.model.ts # Image Mongoose model and schema
│       ├── image.service.ts # Sharp image processing service
│       ├── file.service.ts # File upload and download handling
│       └── image.service.test.ts # Image processing tests
└── test/
    └── setup.ts        # Test configuration and global setup
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
- `npm test` - Run tests once and exit
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## API Endpoints

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
- `POST /tasks` - Create a new image processing task
- `GET /tasks/:id` - Get task status and results

**Features:**
- ✅ Task creation with validation
- ✅ Task retrieval by ID
- ✅ Asynchronous image processing
- ✅ Random price generation (5-50)
- ✅ Status management (pending → completed/failed)
- ✅ Error handling and cleanup
- ✅ OpenAPI documentation

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

For testing, create a `.env.test` file:

```env
NODE_ENV=test
LOG_LEVEL=silent
```

## Testing

The project uses **Vitest** for testing with ES module support:

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Current Test Coverage:**
- ✅ Express app factory
- ✅ Health check endpoint
- ✅ 404 handler for unknown routes
- ✅ Global error handling
- ✅ Image processing service (MD5, file operations)
- ✅ Task service (creation, retrieval, validation)
- ✅ Error handling and edge cases

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
- **Integration tests** for Express endpoints
- **Test isolation** with proper setup/teardown

### Development Experience
- **tsx** for fast development with hot reload
- **Structured logging** with Pino
- **Security middleware** (helmet, cors, morgan)

## License

ISC 