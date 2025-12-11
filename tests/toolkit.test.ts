import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getOctokit, getWorkspace, getPackageJSON, setTestPackageJSON, context } from '../src/toolkit.js';

describe('toolkit', () => {
  beforeEach(() => {
    // Clear test package JSON override
    setTestPackageJSON(undefined);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('context', () => {
    it('exports the GitHub context', () => {
      expect(context).toBeDefined();
      expect(context.eventName).toBe('release');
      expect(context.repo).toEqual({ owner: 'raven-actions', repo: 'test' });
    });
  });

  describe('getOctokit', () => {
    it('creates an Octokit client with provided token', () => {
      const octokit = getOctokit('test-token');
      expect(octokit).toBeDefined();
      expect(octokit.rest).toBeDefined();
      expect(octokit.rest.git).toBeDefined();
    });

    it('uses INPUT_GITHUB_TOKEN when no token provided', () => {
      process.env['INPUT_GITHUB_TOKEN'] = 'input-token';
      const octokit = getOctokit();
      expect(octokit).toBeDefined();
      delete process.env['INPUT_GITHUB_TOKEN'];
    });

    it('uses GITHUB_TOKEN env var as fallback', () => {
      const originalInputToken = process.env['INPUT_GITHUB_TOKEN'];
      delete process.env['INPUT_GITHUB_TOKEN'];
      process.env['GITHUB_TOKEN'] = 'env-token';

      const octokit = getOctokit();
      expect(octokit).toBeDefined();

      // Restore
      if (originalInputToken) {
        process.env['INPUT_GITHUB_TOKEN'] = originalInputToken;
      }
    });

    it('throws when no token is available', () => {
      const originalInputToken = process.env['INPUT_GITHUB_TOKEN'];
      const originalEnvToken = process.env['GITHUB_TOKEN'];

      delete process.env['INPUT_GITHUB_TOKEN'];
      delete process.env['GITHUB_TOKEN'];

      expect(() => getOctokit()).toThrow('No GitHub token provided');

      // Restore
      if (originalInputToken) process.env['INPUT_GITHUB_TOKEN'] = originalInputToken;
      if (originalEnvToken) process.env['GITHUB_TOKEN'] = originalEnvToken;
    });
  });

  describe('getWorkspace', () => {
    it('returns GITHUB_WORKSPACE env var', () => {
      const workspace = getWorkspace();
      expect(workspace).toContain('fixtures');
      expect(workspace).toContain('workspace');
    });

    it('falls back to cwd when GITHUB_WORKSPACE not set', () => {
      const originalWorkspace = process.env['GITHUB_WORKSPACE'];
      delete process.env['GITHUB_WORKSPACE'];

      const workspace = getWorkspace();
      expect(workspace).toBe(process.cwd());

      // Restore
      if (originalWorkspace) {
        process.env['GITHUB_WORKSPACE'] = originalWorkspace;
      }
    });
  });

  describe('getPackageJSON', () => {
    it('returns test package JSON when set', () => {
      const testPkg = { name: 'test-package', version: '1.0.0' };
      setTestPackageJSON(testPkg);

      const result = getPackageJSON<{ name: string; version: string }>();
      expect(result).toEqual(testPkg);
    });

    it('reads package.json from workspace when no test override', () => {
      setTestPackageJSON(undefined);

      const result = getPackageJSON<{ main: string }>();
      // The fixture workspace has a package.json with main field
      expect(result).toHaveProperty('main');
      expect(result.main).toBe('dist/index.js');
    });

    it('throws when package.json does not exist', () => {
      setTestPackageJSON(undefined);
      const originalWorkspace = process.env['GITHUB_WORKSPACE'];

      // Point to a directory without package.json
      process.env['GITHUB_WORKSPACE'] = '/nonexistent/path';

      expect(() => getPackageJSON()).toThrow("package.json could not be found in your project's root.");

      // Restore
      if (originalWorkspace) {
        process.env['GITHUB_WORKSPACE'] = originalWorkspace;
      }
    });
  });

  describe('setTestPackageJSON', () => {
    it('sets and clears test package JSON', () => {
      const testPkg = { test: true };
      setTestPackageJSON(testPkg);
      expect(getPackageJSON()).toEqual(testPkg);

      setTestPackageJSON(undefined);
      // Now it should read from file system
      const result = getPackageJSON<{ main: string }>();
      expect(result).toHaveProperty('main');
    });
  });
});
