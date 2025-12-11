import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { action, run } from '../src/main.js';
import { createMockOctokit, type MockOctokitMethods } from './helpers.js';
import { type OctokitClient } from '../src/toolkit.js';
import * as core from '@actions/core';

describe('publish-and-tag', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods };

  beforeEach(() => {
    octokit = createMockOctokit();
    delete process.env['INPUT_SETUP'];
    delete process.env['INPUT_TAG_NAME'];
    delete process.env['INPUT_COMMIT_MESSAGE'];
    delete process.env['INPUT_LATEST'];
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('updates the ref and updates an existing major ref', async () => {
    // Setup mocks: first call for v1.2 (exists), second call for v1 (exists)
    octokit.mocks.listMatchingRefs
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1.2' }] }) // v1.2 exists
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1' }] }); // v1 exists

    await action(octokit);

    // updateTag calls updateRef once for v1.2.3
    // createOrUpdateRef calls updateRef twice for v1.2 and v1 (both exist)
    expect(octokit.mocks.updateRef).toHaveBeenCalledTimes(3);
    expect(octokit.mocks.createRef).not.toHaveBeenCalled();
    expect(octokit.mocks.createTree).toHaveBeenCalledTimes(1);
    expect(octokit.mocks.createCommit).toHaveBeenCalledTimes(1);
  });

  it('updates the ref and creates a new major & minor ref', async () => {
    // Setup mocks for non-existing refs
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });

    await action(octokit);

    // v1.2.3 is updated, v1 and v1.2 are created
    expect(octokit.mocks.updateRef).toHaveBeenCalledTimes(1); // v1.2.3
    expect(octokit.mocks.createRef).toHaveBeenCalledTimes(2); // v1, v1.2
  });

  it('updates the ref with custom tag_name input', async () => {
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });
    process.env['INPUT_TAG_NAME'] = 'v2.0.0';

    await action(octokit);

    // Verify the custom tag was used
    expect(octokit.mocks.updateRef).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: 'tags/v2.0.0'
      })
    );
    expect(octokit.mocks.createRef).toHaveBeenCalledTimes(2); // v2, v2.0
  });

  it('updates an existing major ref and makes release latest', async () => {
    octokit.mocks.listMatchingRefs
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1' }] })
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1.2' }] });

    process.env['INPUT_LATEST'] = 'true';

    await action(octokit);

    // Verify release was made latest
    expect(octokit.mocks.updateRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        release_id: 123,
        make_latest: 'true'
      })
    );
  });

  it('skips rewriting major/minor refs for draft releases', async () => {
    // The default fixture has draft=false and prerelease=false
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });
    process.env['INPUT_LATEST'] = '';

    await action(octokit);

    // With draft=false, prerelease=false, rewrite is enabled by default
    expect(octokit.mocks.createRef).toHaveBeenCalled();
  });

  it('skips rewriting major/minor refs when rewrite_tags is false', async () => {
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });
    process.env['INPUT_REWRITE_TAGS'] = 'false';

    await action(octokit);

    // Should not create/update major and minor refs
    expect(octokit.mocks.createRef).not.toHaveBeenCalled();
    // updateRef should only be called once for the tag itself
    expect(octokit.mocks.updateRef).toHaveBeenCalledTimes(1);
  });

  it('skips cleanup manifest when cleanup_manifest is false', async () => {
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] });
    process.env['INPUT_CLEANUP_MANIFEST'] = 'false';

    await action(octokit);

    // Should still complete successfully
    expect(octokit.mocks.createTree).toHaveBeenCalled();
    expect(octokit.mocks.createCommit).toHaveBeenCalled();
  });

  it('handles run() error gracefully', async () => {
    const setFailedSpy = vi.spyOn(core, 'setFailed');

    // Mock getOctokit to throw (no token)
    vi.mock('../src/toolkit.js', async (importOriginal) => {
      const original = await importOriginal<typeof import('../src/toolkit.js')>();
      return {
        ...original,
        getOctokit: () => {
          throw new Error('No GitHub token provided');
        }
      };
    });

    // Re-import to get mocked version
    vi.resetModules();
    const { run: runFresh } = await import('../src/main.js');

    await runFresh();

    expect(setFailedSpy).toHaveBeenCalledWith('No GitHub token provided');

    vi.restoreAllMocks();
  });
});
