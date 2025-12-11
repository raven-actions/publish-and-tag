import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createOrUpdateRef from '../src/create-or-update-ref.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { type OctokitClient } from '../src/toolkit.js';

describe('create-or-update-ref', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods };

  beforeEach(() => {
    octokit = createMockOctokit();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

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
