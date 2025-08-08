export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly code = 'VALIDATION_ERROR';

  constructor(message: string, public readonly details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly code = 'NOT_FOUND';

  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class ProcessingError extends Error {
  public readonly statusCode = 500;
  public readonly code = 'PROCESSING_ERROR';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class DatabaseError extends Error {
  public readonly statusCode = 500;
  public readonly code = 'DATABASE_ERROR';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class FileSystemError extends Error {
  public readonly statusCode = 500;
  public readonly code = 'FILE_SYSTEM_ERROR';

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'FileSystemError';
  }
}

// Error response formatter
export function formatErrorResponse(error: Error): {
  error: string;
  message: string;
  code?: string;
  details?: Array<{ field: string; message: string }>;
} {
  const baseResponse = {
    error: error.name,
    message: error.message,
  };

  if ('code' in error && error.code) {
    return {
      ...baseResponse,
      code: error.code as string,
    };
  }

  return baseResponse;
}

// Error handler middleware
import { Request, Response } from 'express';

export function errorHandler(error: Error, _req: Request, res: Response): Response | void {
  // Log the error (using console for error logging is acceptable)
  // eslint-disable-next-line no-console
  console.error('Error:', error);

  // Handle known errors
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json({
      error: 'Validation Error',
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(error.statusCode).json({
      error: 'Not Found',
      message: error.message,
      code: error.code,
    });
  }

  if (error instanceof ProcessingError) {
    return res.status(error.statusCode).json({
      error: 'Processing Error',
      message: error.message,
      code: error.code,
    });
  }

  if (error instanceof DatabaseError) {
    return res.status(error.statusCode).json({
      error: 'Database Error',
      message: error.message,
      code: error.code,
    });
  }

  if (error instanceof FileSystemError) {
    return res.status(error.statusCode).json({
      error: 'File System Error',
      message: error.message,
      code: error.code,
    });
  }

  // Handle unknown errors
  const statusCode = 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500;
  const message = process.env['NODE_ENV'] === 'production' 
    ? 'Internal Server Error' 
    : error.message;

  return res.status(statusCode).json({
    error: 'Internal Server Error',
    message,
  });
}
