import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWorkspace } from '../src/toolkit.js';
import cleanupActionManifest from '../src/cleanup-action-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('cleanup-action-manifest', () => {
  afterEach(() => {
    vi.resetAllMocks();
    delete process.env['GITHUB_WORKSPACE'];
  });

  it('should not update the runs property when mainFromPackage is composite', () => {
    process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'composite');
    const workspace = getWorkspace();

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8');

    // Create mock functions
    const mockReadFile = vi.fn<(baseDir: string, file: string) => string>();
    const mockWriteFile = vi.fn<(baseDir: string, file: string, content: string) => void>();

    mockReadFile.mockReturnValue(sourceActionManifest);

    cleanupActionManifest(mockReadFile, mockWriteFile);

    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest);
  });

  it('should not update the runs property when mainFromPackage is docker', () => {
    process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'docker');
    const workspace = getWorkspace();

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8');

    // Create mock functions
    const mockReadFile = vi.fn<(baseDir: string, file: string) => string>();
    const mockWriteFile = vi.fn<(baseDir: string, file: string, content: string) => void>();

    mockReadFile.mockReturnValue(sourceActionManifest);

    cleanupActionManifest(mockReadFile, mockWriteFile);
    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest);
  });

  it('should update the runs property when mainFromPackage is javascript', () => {
    process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'javascript-cleanup');
    const workspace = getWorkspace();

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action-expected.yml'), 'utf8');
    const originalActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8');

    // Create mock functions
    const mockReadFile = vi.fn<(baseDir: string, file: string) => string>();
    const mockWriteFile = vi.fn<(baseDir: string, file: string, content: string) => void>();

    mockReadFile.mockReturnValue(originalActionManifest);

    cleanupActionManifest(mockReadFile, mockWriteFile);
    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest);
  });

  it('should throw an error when the YAML is invalid', () => {
    // Create mock functions
    const mockReadFile = vi.fn<(baseDir: string, file: string) => string>();
    const mockWriteFile = vi.fn<(baseDir: string, file: string, content: string) => void>();

    mockReadFile.mockReturnValue('test: {');

    expect(() => cleanupActionManifest(mockReadFile, mockWriteFile)).toThrow(/Unable to parse Action Manifest file/);
  });

  it('should throw an error when the YAML is not an object', () => {
    // Create mock functions
    const mockReadFile = vi.fn<(baseDir: string, file: string) => string>();
    const mockWriteFile = vi.fn<(baseDir: string, file: string, content: string) => void>();

    mockReadFile.mockReturnValue('not an object');

    expect(() => cleanupActionManifest(mockReadFile, mockWriteFile)).toThrow(/does not contain valid YAML object/);
  });
});
