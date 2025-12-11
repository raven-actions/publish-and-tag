import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import createCommit from '../src/create-commit.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { context, type OctokitClient } from '../src/toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('create-commit', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods };
  let gitCommitMessage: string;
  let gitAuthorName: string;
  let gitAuthorEmail: string;
  let gitCommitterName: string;
  let gitCommitterEmail: string;

  beforeEach(() => {
    octokit = createMockOctokit();
    gitCommitMessage = 'Automatic compilation';
    gitAuthorName = 'github-actions[bot]';
    gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com';
    gitCommitterName = 'github-actions[bot]';
    gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com';
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env['GITHUB_WORKSPACE'];
  });

  describe('JavaScript Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'javascript');
    });

    it('creates the tree and commit - only main', async () => {
      const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
      mockGetFilesFromPackage.mockResolvedValue({ files: ['dist/index.js'] });

      await createCommit(
        octokit,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitterName,
        gitCommitterEmail,
        mockGetFilesFromPackage
      );

      // Verify tree was created with correct files
      expect(octokit.mocks.createTree).toHaveBeenCalledTimes(1);
      const treeCall = octokit.mocks.createTree.mock.calls[0]![0];
      expect(treeCall.tree).toHaveLength(2);
      expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'dist/index.js')).toBeTruthy();

      // Verify commit was created correctly
      expect(octokit.mocks.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Automatic compilation',
          parents: [context.sha]
        })
      );
    });

    it('creates the tree - only files', async () => {
      const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
      mockGetFilesFromPackage.mockResolvedValue({ files: ['README.md'] });

      await createCommit(
        octokit,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitterName,
        gitCommitterEmail,
        mockGetFilesFromPackage
      );

      const treeCall = octokit.mocks.createTree.mock.calls[0]![0];
      expect(treeCall.tree).toHaveLength(2);
      expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'README.md')).toBeTruthy();
    });

    it('creates the tree - main and files', async () => {
      const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
      mockGetFilesFromPackage.mockResolvedValue({
        files: ['dist/index.js', 'README.md']
      });

      await createCommit(
        octokit,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitterName,
        gitCommitterEmail,
        mockGetFilesFromPackage
      );

      const treeCall = octokit.mocks.createTree.mock.calls[0]![0];
      expect(treeCall.tree).toHaveLength(3);
      expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'dist/index.js')).toBeTruthy();
      expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'README.md')).toBeTruthy();
    });
  });

  describe('Composite Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'composite');
    });

    it('chmod', async () => {
      const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
      mockGetFilesFromPackage.mockResolvedValue({
        files: ['entrypoint.sh', 'main.js']
      });

      await createCommit(
        octokit,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitterName,
        gitCommitterEmail,
        mockGetFilesFromPackage
      );

      // Verify commit was created correctly
      expect(octokit.mocks.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Automatic compilation',
          parents: [context.sha]
        })
      );

      // Verify tree structure
      const treeCall = octokit.mocks.createTree.mock.calls[0]![0];
      expect(treeCall.tree).toHaveLength(3);
      expect(
        treeCall.tree.some(
          (obj: { path: string; mode: string }) => obj.path === 'entrypoint.sh' && obj.mode === '100755'
        )
      ).toBeTruthy();
      expect(
        treeCall.tree.some((obj: { path: string; mode: string }) => obj.path === 'main.js' && obj.mode === '100644')
      ).toBeTruthy();
    });
  });

  describe('Docker Action', () => {
    beforeEach(() => {
      process.env['GITHUB_WORKSPACE'] = path.resolve(__dirname, 'fixtures', 'workspace', 'docker');
    });

    it('chmod', async () => {
      const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
      mockGetFilesFromPackage.mockResolvedValue({
        files: ['entrypoint.sh', 'Dockerfile']
      });

      await createCommit(
        octokit,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        gitCommitterName,
        gitCommitterEmail,
        mockGetFilesFromPackage
      );

      // Verify commit was created correctly
      expect(octokit.mocks.createCommit).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Automatic compilation',
          parents: [context.sha]
        })
      );

      // Verify mock was called
      expect(mockGetFilesFromPackage).toHaveBeenCalled();

      // Verify tree structure: action.yml + entrypoint.sh + Dockerfile
      const treeCall = octokit.mocks.createTree.mock.calls[0]![0];
      expect(treeCall.tree).toHaveLength(3);
      expect(
        treeCall.tree.some(
          (obj: { path: string; mode: string }) => obj.path === 'entrypoint.sh' && obj.mode === '100755'
        )
      ).toBeTruthy();
      expect(
        treeCall.tree.some((obj: { path: string; mode: string }) => obj.path === 'Dockerfile' && obj.mode === '100644')
      ).toBeTruthy();
      expect(
        treeCall.tree.some((obj: { path: string; mode: string }) => obj.path === 'action.yml' && obj.mode === '100644')
      ).toBeTruthy();
    });
  });
});
