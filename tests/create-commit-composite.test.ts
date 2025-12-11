import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import createCommit from '../src/create-commit.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { context, type OctokitClient } from '../src/toolkit.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('create-commit (Composite Action)', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods };
  let gitCommitMessage: string;
  let gitAuthorName: string;
  let gitAuthorEmail: string;
  let gitCommitterName: string;
  let gitCommitterEmail: string;

  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite');
    octokit = createMockOctokit();
    gitCommitMessage = 'Automatic compilation';
    gitAuthorName = 'github-actions[bot]';
    gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com';
    gitCommitterName = 'github-actions[bot]';
    gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com';
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.GITHUB_WORKSPACE;
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
    const treeCall = octokit.mocks.createTree.mock.calls[0][0];
    expect(treeCall.tree).toHaveLength(3);
    expect(
      treeCall.tree.some((obj: { path: string; mode: string }) => obj.path === 'entrypoint.sh' && obj.mode === '100755')
    ).toBeTruthy();
    expect(
      treeCall.tree.some((obj: { path: string; mode: string }) => obj.path === 'main.js' && obj.mode === '100644')
    ).toBeTruthy();
  });
});
