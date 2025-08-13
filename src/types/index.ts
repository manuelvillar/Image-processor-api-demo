import type { Logger } from 'pino';

// Application Configuration Types (used across app, server, config, tests)
export interface AppConfig {
  port: number;
  logger: Logger;
}

// MongoDB Connection Types (used in infra and potentially other places)
export interface MongoConnectionOptions {
  uri: string;
  dbName: string;
  maxRetries?: number;
  retryDelay?: number;
}



// Validation Schema Types (from Zod) - used in validation and potentially other places
export type CreateTaskRequestSchema = import('zod').z.infer<typeof import('../common/validation.js').CreateTaskRequestSchema>;
export type GetTaskResponseSchema = import('zod').z.infer<typeof import('../common/validation.js').GetTaskResponseSchema>;
export type ImageSchema = import('zod').z.infer<typeof import('../common/validation.js').ImageSchema>;
