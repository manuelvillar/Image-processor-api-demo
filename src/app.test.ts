import request from 'supertest';
import { Express } from 'express';
import { createApp, AppConfig } from './app.js';
import pino from 'pino';

describe('App', () => {
  let app: Express;

  beforeEach(() => {
    const logger = pino({ level: 'silent' });
    const config: AppConfig = { port: 3000, logger };
    app = createApp(config);
  });

  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });
  });
}); 