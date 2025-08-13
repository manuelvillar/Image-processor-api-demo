import pino from 'pino';
import { createApp } from './app.js';
import type { AppConfig } from './types/index.js';
import { mongoConnection } from './infra/mongo.js';
import { appConfig, validateConfig } from './config/index.js';

// Validate configuration before starting
validateConfig();

const logger = pino({
  level: appConfig.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

const config: AppConfig = {
  port: appConfig.port,
  logger,
};

const app = createApp(config);

// Initialize MongoDB connection
async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    await mongoConnection.connect();
    logger.info('MongoDB connected successfully');
    
    // Start the server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await mongoConnection.disconnect();
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(async () => {
        await mongoConnection.disconnect();
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${(error as Error).message}`);
    process.exit(1);
  }
}

startServer(); 