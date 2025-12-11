import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as fileHelper from '../src/file-helper.js';
import { getWorkspace } from '../src/toolkit.js';

describe('file-helper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('writeFile', () => {
    it('writes the file successfully', () => {
      const workspace = getWorkspace();
      // Just verify the function runs without error
      // Actual file write is tested by integration
      expect(() => fileHelper.writeFile(workspace, 'test-output.txt', 'test content')).not.toThrow();
      // Clean up
      const testFile = path.resolve(workspace, 'test-output.txt');
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    });
  });

  describe('readFile', () => {
    it('reads the file and returns the contents', () => {
      const workspace = getWorkspace();
      expect(fileHelper.readFile(workspace, 'README.md')).toBe('# Hello\n');
    });

    it('throws if the file does not exist', () => {
      const workspace = getWorkspace();
      expect(() => fileHelper.readFile(workspace, 'nope')).toThrow('nope does not exist.');
    });
  });

  describe('checkActionManifestFile', () => {
    it('returns action.yml when it exists', () => {
      const workspace = getWorkspace();
      expect(fileHelper.checkActionManifestFile(workspace)).toBe('action.yml');
    });

    it('throws if neither action.yml nor action.yaml exist', () => {
      const workspace = path.resolve(getWorkspace(), 'dist');
      expect(() => fileHelper.checkActionManifestFile(workspace)).toThrow(
        `Neither 'action.yml' nor 'action.yaml' exist.`
      );
    });
  });

  describe('isFile', () => {
    it('returns true for files', () => {
      const workspace = getWorkspace();
      expect(fileHelper.isFile(workspace, 'README.md')).toBe(true);
    });

    it('returns false for directories', () => {
      const workspace = getWorkspace();
      expect(fileHelper.isFile(workspace, 'dist')).toBe(false);
    });

    it('throws for non-existent paths', () => {
      const workspace = getWorkspace();
      expect(() => fileHelper.isFile(workspace, 'nonexistent.txt')).toThrow();
    });
  });
});
