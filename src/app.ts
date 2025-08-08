import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pino from 'pino';

export interface AppConfig {
  port: number;
  logger: pino.Logger;
}

export function createApp(config: AppConfig): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());

  // Logging middleware
  app.use(morgan('combined'));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    config.logger.info({
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 404 handler - catch all unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    config.logger.error(err, 'Unhandled error');
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env['NODE_ENV'] === 'development' ? err.message : 'Something went wrong',
    });
  });

  return app;
} 