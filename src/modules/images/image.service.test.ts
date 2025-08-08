import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { imageService } from './image.service.js';

describe('ImageService', () => {
  const testImagePath = path.join(process.cwd(), 'test-images', 'test-image.jpg');
  const testOutputDir = path.join(process.cwd(), 'test-output');

  beforeEach(() => {
    // Create test directories
    if (!fs.existsSync(path.dirname(testImagePath))) {
      fs.mkdirSync(path.dirname(testImagePath), { recursive: true });
    }
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('generateMd5', () => {
    it('should generate consistent MD5 hash for the same content', async () => {
      const testContent = 'test content';
      const testFilePath = path.join(testOutputDir, 'test.txt');
      
      fs.writeFileSync(testFilePath, testContent);
      
      const md5_1 = await imageService.generateMd5(testFilePath);
      const md5_2 = await imageService.generateMd5(testFilePath);
      
      expect(md5_1).toBe(md5_2);
      expect(md5_1).toHaveLength(32);
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const testFilePath = path.join(testOutputDir, 'test.txt');
      fs.writeFileSync(testFilePath, 'test content');
      
      const exists = await imageService.fileExists(testFilePath);
      expect(exists).toBe(true);
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });

    it('should return false for non-existing file', async () => {
      const testFilePath = path.join(testOutputDir, 'non-existing.txt');
      
      const exists = await imageService.fileExists(testFilePath);
      expect(exists).toBe(false);
    });
  });

  describe('getFileSize', () => {
    it('should return correct file size', async () => {
      const testContent = 'test content';
      const testFilePath = path.join(testOutputDir, 'test.txt');
      fs.writeFileSync(testFilePath, testContent);
      
      const size = await imageService.getFileSize(testFilePath);
      expect(size).toBe(testContent.length);
      
      // Clean up
      fs.unlinkSync(testFilePath);
    });
  });

});
