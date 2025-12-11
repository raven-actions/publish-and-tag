import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createCommit from '../src/create-commit.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { context, type OctokitClient } from '../src/toolkit.js';

describe('create-commit (JavaScript Action)', () => {
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
    const treeCall = octokit.mocks.createTree.mock.calls[0][0];
    expect(treeCall.tree).toHaveLength(2);
    expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'dist/index.js')).toBeTruthy();

    // Verify commit was created correctly
    expect(octokit.mocks.createCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Automatic compilation',
        parents: [context.sha],
        tree: '456def'
      })
    );
  });

  it('creates the tree - only files', async () => {
    const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
    mockGetFilesFromPackage.mockResolvedValue({
      files: ['README.md', 'dist/additional.js']
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

    // Verify tree was created with correct files
    const treeCall = octokit.mocks.createTree.mock.calls[0][0];
    expect(treeCall.tree).toHaveLength(3);
    expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'README.md')).toBeTruthy();
    expect(treeCall.tree.some((obj: { path: string }) => obj.path === 'dist/additional.js')).toBeTruthy();
  });

  it('creates the tree - main and files', async () => {
    const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>();
    mockGetFilesFromPackage.mockResolvedValue({
      files: ['README.md', 'dist/additional.js', 'dist/cleanup.js', 'dist/index.js', 'dist/setup.js']
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

    // Verify tree was created with correct number of files
    const treeCall = octokit.mocks.createTree.mock.calls[0][0];
    expect(treeCall.tree).toHaveLength(6);
  });
});
