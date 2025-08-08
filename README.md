# Image Processor API

A REST API for image processing tasks with MongoDB persistence, built with Node.js, TypeScript, and Express.

## Problem Statement

Build a REST API that:
1. Accepts image processing tasks (POST /tasks)
2. Processes images to generate variants at 1024px and 800px width
3. Provides task status and results (GET /tasks/:id)
4. Stores metadata in MongoDB with random pricing (5-50)

## Current Status

**Step 2 Complete**: Database models and validation infrastructure.

✅ **Completed Features:**
- Express.js server with security middleware (helmet, cors, morgan)
- Health check endpoint (`GET /health`) with MongoDB status
- Centralized error handling and 404 responses
- TypeScript configuration with NodeNext ES modules
- Testing infrastructure with Vitest
- Code quality tools (ESLint, Prettier)
- Development environment with hot reload
- Production build system
- **NEW**: Docker Compose setup for MongoDB
- **NEW**: MongoDB connection with retry logic
- **NEW**: Configuration management with environment variables
- **NEW**: Database health monitoring
- **NEW**: Graceful shutdown with MongoDB disconnection
- **NEW**: Mongoose models for Tasks and Images
- **NEW**: Zod validation schemas for request validation
- **NEW**: Custom error classes for consistent error handling
- **NEW**: Type-safe database operations

🔄 **Next Steps:**
- Step 3: Image processing with Sharp
- Step 4: Task management endpoints
- Step 5: API documentation and testing

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
│   │   └── task.model.ts # Task Mongoose model and schema
│   └── images/
│       └── image.model.ts # Image Mongoose model and schema
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

### Tasks (Coming Soon)
- `POST /tasks` - Create a new image processing task
- `GET /tasks/:id` - Get task status and results

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