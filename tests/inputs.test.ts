import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as inputs from '../src/inputs.js';

// Mock the toolkit module
vi.mock('../src/toolkit.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/toolkit.js')>();
  return {
    ...original,
    context: {
      ...original.context,
      eventName: 'release',
      payload: {
        release: {
          tag_name: 'v1.2.3'
        }
      }
    }
  };
});

describe('inputs', () => {
  beforeEach(() => {
    // Clear all input env vars
    delete process.env['INPUT_CLEANUP_MANIFEST'];
    delete process.env['INPUT_LATEST'];
    delete process.env['INPUT_REWRITE_TAGS'];
    delete process.env['INPUT_TAG_NAME'];
    delete process.env['INPUT_GIT_COMMIT_MESSAGE'];
    delete process.env['INPUT_GIT_AUTHOR_NAME'];
    delete process.env['INPUT_GIT_AUTHOR_EMAIL'];
    delete process.env['INPUT_GIT_COMMITTER_NAME'];
    delete process.env['INPUT_GIT_COMMITTER_EMAIL'];
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCleanupManifest', () => {
    it('default', () => {
      expect(inputs.getCleanupManifest()).toBeTruthy();
    });

    it('empty', () => {
      process.env['INPUT_CLEANUP_MANIFEST'] = '';
      expect(inputs.getCleanupManifest()).toBeTruthy();
    });

    it('true', () => {
      process.env['INPUT_CLEANUP_MANIFEST'] = 'true';
      expect(inputs.getCleanupManifest()).toBeTruthy();
    });

    it('false', () => {
      process.env['INPUT_CLEANUP_MANIFEST'] = 'false';
      expect(inputs.getCleanupManifest()).toBeFalsy();
    });

    it('not bool value', () => {
      process.env['INPUT_CLEANUP_MANIFEST'] = 'test';
      expect(() => inputs.getCleanupManifest()).toThrow('cleanup_manifest is not valid bool value!');
    });
  });

  describe('getMakeLatest', () => {
    it('default', () => {
      expect(inputs.getMakeLatest()).toBeFalsy();
    });

    it('empty', () => {
      process.env['INPUT_LATEST'] = '';
      expect(inputs.getMakeLatest()).toBeFalsy();
    });

    it('true', () => {
      process.env['INPUT_LATEST'] = 'true';
      expect(inputs.getMakeLatest()).toBeTruthy();
    });

    it('false', () => {
      process.env['INPUT_LATEST'] = 'false';
      expect(inputs.getMakeLatest()).toBeFalsy();
    });

    it('not bool value', () => {
      process.env['INPUT_LATEST'] = 'test';
      expect(() => inputs.getMakeLatest()).toThrow('latest is not valid bool value!');
    });
  });

  describe('getRewriteTags', () => {
    it('default', () => {
      expect(inputs.getRewriteTags()).toBeFalsy();
    });

    it('empty', () => {
      process.env['INPUT_REWRITE_TAGS'] = '';
      expect(inputs.getRewriteTags()).toBeFalsy();
    });

    it('true', () => {
      process.env['INPUT_REWRITE_TAGS'] = 'true';
      expect(inputs.getRewriteTags()).toBeTruthy();
    });

    it('false', () => {
      process.env['INPUT_REWRITE_TAGS'] = 'false';
      expect(inputs.getRewriteTags()).toBeFalsy();
    });

    it('not bool value', () => {
      process.env['INPUT_REWRITE_TAGS'] = 'test';
      expect(() => inputs.getRewriteTags()).toThrow('rewrite_tags is not valid bool value!');
    });
  });

  describe('getTagName', () => {
    it('gets the tag from the release payload', () => {
      const result = inputs.getTagName();
      expect(result).toBe('v1.2.3');
    });

    it('gets the tag from the input', () => {
      process.env['INPUT_TAG_NAME'] = 'v2.1.1';
      const result = inputs.getTagName();
      expect(result).toBe('v2.1.1');
    });

    it('throws when eventName is not release and no input provided', async () => {
      // Reset modules and re-mock with non-release event
      vi.resetModules();
      vi.doMock('../src/toolkit.js', async (importOriginal) => {
        const original = await importOriginal<typeof import('../src/toolkit.js')>();
        return {
          ...original,
          context: {
            ...original.context,
            eventName: 'push',
            payload: {}
          }
        };
      });

      // Re-import inputs to pick up the new mock
      const inputsReimported = await import('../src/inputs.js');

      expect(() => inputsReimported.getTagName()).toThrow('No tag_name was found or provided!');
    });
  });

  describe('getGit', () => {
    it('git-commit-message - default', () => {
      expect(inputs.getGitCommitMessage()).toBe('Automatic compilation');
    });

    it('git-commit-message - empty', () => {
      process.env['INPUT_GIT_COMMIT_MESSAGE'] = '';
      expect(inputs.getGitCommitMessage()).toBe('Automatic compilation');
    });

    it('git-commit-message - custom', () => {
      process.env['INPUT_GIT_COMMIT_MESSAGE'] = 'test commit message';
      expect(inputs.getGitCommitMessage()).toBe('test commit message');
    });

    it('git-author-name - default', () => {
      expect(inputs.getGitAuthorName()).toBe('github-actions[bot]');
    });

    it('git-author-name - empty', () => {
      process.env['INPUT_GIT_AUTHOR_NAME'] = '';
      expect(inputs.getGitAuthorName()).toBe('github-actions[bot]');
    });

    it('git-author-name - custom', () => {
      process.env['INPUT_GIT_AUTHOR_NAME'] = 'custom-actions[bot]';
      expect(inputs.getGitAuthorName()).toBe('custom-actions[bot]');
    });

    it('git-author-email - default', () => {
      expect(inputs.getGitAuthorEmail()).toBe('41898282+github-actions[bot]@users.noreply.github.com');
    });

    it('git-author-email - empty', () => {
      process.env['INPUT_GIT_AUTHOR_EMAIL'] = '';
      expect(inputs.getGitAuthorEmail()).toBe('41898282+github-actions[bot]@users.noreply.github.com');
    });

    it('git-author-email - custom', () => {
      process.env['INPUT_GIT_AUTHOR_EMAIL'] = 'custom@example.com';
      expect(inputs.getGitAuthorEmail()).toBe('custom@example.com');
    });

    it('git-committer-name - default', () => {
      expect(inputs.getGitCommitterName()).toBe('github-actions[bot]');
    });

    it('git-committer-name - empty', () => {
      process.env['INPUT_GIT_COMMITTER_NAME'] = '';
      expect(inputs.getGitCommitterName()).toBe('github-actions[bot]');
    });

    it('git-committer-name - custom', () => {
      process.env['INPUT_GIT_COMMITTER_NAME'] = 'custom-actions[bot]';
      expect(inputs.getGitCommitterName()).toBe('custom-actions[bot]');
    });

    it('git-committer-email - default', () => {
      expect(inputs.getGitCommitterEmail()).toBe('41898282+github-actions[bot]@users.noreply.github.com');
    });

    it('git-committer-email - empty', () => {
      process.env['INPUT_GIT_COMMITTER_EMAIL'] = '';
      expect(inputs.getGitCommitterEmail()).toBe('41898282+github-actions[bot]@users.noreply.github.com');
    });

    it('git-committer-email - custom', () => {
      process.env['INPUT_GIT_COMMITTER_EMAIL'] = 'custom@example.com';
      expect(inputs.getGitCommitterEmail()).toBe('custom@example.com');
    });
  });
});
