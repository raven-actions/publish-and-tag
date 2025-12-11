import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { setTestPackageJSON } from '../src/toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('get-from-package (JavaScript Action)', () => {
  beforeEach(() => {
    process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'glob');
  });

  afterEach(() => {
    setTestPackageJSON(undefined);
    vi.restoreAllMocks();
    delete process.env['GITHUB_WORKSPACE'];
  });

  it('main', async () => {
    setTestPackageJSON({ main: 'dist/index.js' });
    const result = await getMainFromPackage();
    expect(result).toBe('dist/index.js');
  });

  it('files - main and additional files with * glob', async () => {
    const result = await getFilesFromPackage();
    expect(result.files).toHaveLength(6);
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy();
    expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy();
    expect(result.files?.some((obj: any) => obj === 'dist/cleanup.js')).toBeTruthy();
  });
});
