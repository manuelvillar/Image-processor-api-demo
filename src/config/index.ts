import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
config();

export interface AppConfig {
  // Server configuration
  port: number;
  nodeEnv: string;
  
  // Database configuration
  mongoUri: string;
  mongoDbName: string;
  
  // File system configuration
  outputDir: string;
  tempDir: string;
  
  // Image processing configuration
  maxDownloadSize: number; // in MB
  allowedImageTypes: string[];
  
  // Logging configuration
  logLevel: string;
}

// Removed unused function

function getOptionalEnvVar(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

function getOptionalNumberEnvVar(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable ${name}: ${value}`);
  }
  return num;
}

export const appConfig: AppConfig = {
  // Server configuration
  port: getOptionalNumberEnvVar('PORT', 3000),
  nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
  
  // Database configuration
  mongoUri: getOptionalEnvVar('MONGO_URI', 'mongodb://admin:password@localhost:27017/image_processor?authSource=admin'),
  mongoDbName: getOptionalEnvVar('MONGO_DB_NAME', 'image_processor'),
  
  // File system configuration
  outputDir: getOptionalEnvVar('OUTPUT_DIR', path.join(process.cwd(), 'output')),
  tempDir: getOptionalEnvVar('TMP_DIR', path.join(process.cwd(), 'temp')),
  
  // Image processing configuration
  maxDownloadSize: getOptionalNumberEnvVar('MAX_DOWNLOAD_MB', 25),
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  
  // Logging configuration
  logLevel: getOptionalEnvVar('LOG_LEVEL', 'info'),
};

// Validate configuration
export function validateConfig(): void {
  // Ensure output and temp directories exist
  if (!fs.existsSync(appConfig.outputDir)) {
    fs.mkdirSync(appConfig.outputDir, { recursive: true });
  }
  
  if (!fs.existsSync(appConfig.tempDir)) {
    fs.mkdirSync(appConfig.tempDir, { recursive: true });
  }
  
  // Validate port range
  if (appConfig.port < 1 || appConfig.port > 65535) {
    throw new Error(`Invalid port number: ${appConfig.port}`);
  }
  
  // Validate download size
  if (appConfig.maxDownloadSize < 1 || appConfig.maxDownloadSize > 100) {
    throw new Error(`Invalid max download size: ${appConfig.maxDownloadSize}MB`);
  }
}

export default appConfig;
