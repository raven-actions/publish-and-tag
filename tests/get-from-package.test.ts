import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js';
import { setTestPackageJSON } from '../src/toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('get-from-package', () => {
  afterEach(() => {
    setTestPackageJSON(undefined);
    vi.restoreAllMocks();
    delete process.env['GITHUB_WORKSPACE'];
  });

  describe('JavaScript Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'javascript');
    });

    it('main', async () => {
      setTestPackageJSON({ main: 'dist/index.js' });
      const result = await getMainFromPackage();
      expect(result).toBe('dist/index.js');
    });

    it('files - only main', async () => {
      setTestPackageJSON({ main: 'dist/index.js' });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(1);
      expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy();
    });

    it('files - only additional files', async () => {
      setTestPackageJSON({ files: ['dist/index.js', 'README.md'] });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(2);
      expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'README.md')).toBeTruthy();
    });

    it('files - no main, no additional files', async () => {
      setTestPackageJSON({});
      await expect(async () => getFilesFromPackage()).rejects.toThrow(
        'Property "main" or "files" do not exist in your `package.json`.'
      );
    });

    it('files - main and additional files with globs', async () => {
      // This test relies on the default workspace set in setup.ts (fixtures/workspace/javascript)
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(5);
      expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy();
    });

    it('files - main and additional files with * glob', async () => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'glob');
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(6);
      expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'dist/cleanup.js')).toBeTruthy();
    });
  });

  describe('Composite Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'composite');
    });

    it('main', async () => {
      setTestPackageJSON({ main: 'composite' });
      const result = await getMainFromPackage();
      expect(result).toBe('composite');
    });

    it('files - only main', async () => {
      setTestPackageJSON({ main: 'composite' });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(0);
    });

    it('files - only additional files', async () => {
      setTestPackageJSON({ files: ['entrypoint.sh'] });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(1);
      expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy();
    });

    it('files - no main, no additional files', async () => {
      setTestPackageJSON({});
      await expect(async () => getFilesFromPackage()).rejects.toThrow(
        'Property "main" or "files" do not exist in your `package.json`.'
      );
    });

    it('files - main and additional files with globs', async () => {
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(4);
      expect(result.files?.some((obj: any) => obj === 'main.js')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy();
    });
  });

  describe('Docker Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'docker');
    });

    it('main', async () => {
      setTestPackageJSON({ main: 'docker' });
      const result = await getMainFromPackage();
      expect(result).toBe('docker');
    });

    it('files - only main', async () => {
      setTestPackageJSON({ main: 'docker' });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(0);
    });

    it('files - only additional files', async () => {
      setTestPackageJSON({ files: ['Dockerfile'] });
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(1);
      expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy();
    });

    it('files - no main, no additional files', async () => {
      setTestPackageJSON({});
      await expect(async () => getFilesFromPackage()).rejects.toThrow(
        'Property "main" or "files" do not exist in your `package.json`.'
      );
    });

    it('files - main and additional files with globs', async () => {
      const result = await getFilesFromPackage();
      expect(result.files).toHaveLength(3);
      expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy();
      expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy();
    });
  });
});
