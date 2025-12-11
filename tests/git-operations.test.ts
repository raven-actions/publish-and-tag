import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createOrUpdateRef, updateTag, makeReleaseLatest } from '../src/git-operations.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { type OctokitClient } from '../src/toolkit.js';

describe('git-operations', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods };

  beforeEach(() => {
    octokit = createMockOctokit();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createOrUpdateRef', () => {
    it('updates the major ref if it already exists', async () => {
      octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [{ ref: 'tags/v1' }] });

      await createOrUpdateRef(octokit, '123abc', '1');

      expect(octokit.mocks.listMatchingRefs).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'tags/v1'
      });
      expect(octokit.mocks.updateRef).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        force: true,
        ref: 'tags/v1',
        sha: '123abc'
      });
      expect(octokit.mocks.createRef).not.toHaveBeenCalled();
    });

    it('creates a new major ref if it does not already exist', async () => {
      octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });

      await createOrUpdateRef(octokit, '123abc', '1');

      expect(octokit.mocks.listMatchingRefs).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'tags/v1'
      });
      expect(octokit.mocks.createRef).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'refs/tags/v1',
        sha: '123abc'
      });
      expect(octokit.mocks.updateRef).not.toHaveBeenCalled();
    });

    it('creates a new minor ref if it does not already exist', async () => {
      octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });

      await createOrUpdateRef(octokit, '123abc', '1.0');

      expect(octokit.mocks.listMatchingRefs).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'tags/v1.0'
      });
      expect(octokit.mocks.createRef).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'refs/tags/v1.0',
        sha: '123abc'
      });
    });
  });

  describe('updateTag', () => {
    it('updates the tag', async () => {
      await updateTag(octokit, '123abc', 'v1.0.0');

      expect(octokit.mocks.updateRef).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        ref: 'tags/v1.0.0',
        force: true,
        sha: '123abc'
      });
    });
  });

  describe('makeReleaseLatest', () => {
    it('true', async () => {
      await makeReleaseLatest(octokit, 123);

      expect(octokit.mocks.updateRelease).toHaveBeenCalledWith({
        owner: 'raven-actions',
        repo: 'test',
        release_id: 123,
        prerelease: false,
        make_latest: 'true'
      });
    });
  });
});
