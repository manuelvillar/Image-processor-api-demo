import mongoose from 'mongoose';
import pino from 'pino';
import { appConfig } from '../config/index.js';

const logger = pino({ name: 'mongo' });

export interface MongoConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export class MongoConnection {
  private static instance: MongoConnection;
  private isConnected = false;
  private connectionPromise: Promise<typeof mongoose> | null = null;

  private constructor() {}

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  public async connect(options: MongoConnectionOptions = {}): Promise<typeof mongoose> {
    if (this.isConnected) {
      logger.info('MongoDB already connected');
      return mongoose;
    }

    if (this.connectionPromise) {
      logger.info('MongoDB connection in progress, waiting...');
      return this.connectionPromise;
    }

    const { maxRetries = 5, retryDelay = 5000 } = options;

    this.connectionPromise = this.connectWithRetry(maxRetries, retryDelay);
    return this.connectionPromise;
  }

  private async connectWithRetry(maxRetries: number, retryDelay: number): Promise<typeof mongoose> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Attempting to connect to MongoDB (attempt ${attempt}/${maxRetries})`);
        
        await mongoose.connect(appConfig.mongoUri, {
          dbName: appConfig.mongoDbName,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false,
        });

        this.isConnected = true;
        logger.info('MongoDB connected successfully');
        
        // Set up connection event handlers
        mongoose.connection.on('error', (error) => {
          logger.error('MongoDB connection error:', error);
          this.isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
          this.isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
          logger.info('MongoDB reconnected');
          this.isConnected = true;
        });

        return mongoose;
      } catch (error) {
        lastError = error as Error;
        logger.error(`MongoDB connection attempt ${attempt} failed: ${(error as Error).message}`);
        
        if (attempt < maxRetries) {
          logger.info(`Retrying in ${retryDelay}ms...`);
          await this.sleep(retryDelay);
        }
      }
    }

    this.connectionPromise = null;
    throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      logger.info('MongoDB not connected, nothing to disconnect');
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      this.connectionPromise = null;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error(`Error disconnecting from MongoDB: ${(error as Error).message}`);
      throw error;
    }
  }

  public isConnectedToDb(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public getConnection(): typeof mongoose {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return mongoose;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export a singleton instance
export const mongoConnection = MongoConnection.getInstance();

// Health check function
export async function checkMongoHealth(): Promise<{ status: 'ok' | 'error'; message?: string }> {
  try {
    const connection = mongoConnection.getConnection();
    const db = connection.connection.db;
    if (!db) {
      throw new Error('Database connection not available');
    }
    await db.admin().ping();
    return { status: 'ok' };
  } catch (error) {
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
