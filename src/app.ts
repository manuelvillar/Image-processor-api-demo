import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pino from 'pino';
import { errorHandler } from './common/errors.js';

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
  app.get('/health', async (_req: Request, res: Response) => {
    try {
      const mongoHealth = await import('./infra/mongo.js').then(m => m.checkMongoHealth());
      
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
          server: 'ok',
          database: mongoHealth.status,
          ...(mongoHealth.status === 'error' && { databaseError: mongoHealth.message })
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 404 handler - catch all unmatched routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
} 