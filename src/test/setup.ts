// Test setup file
import { config } from 'dotenv';
import { vi } from 'vitest';

// Load environment variables for tests
config({ path: '.env.test' });

// Global test timeout
vi.setConfig({ testTimeout: 10000 });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
