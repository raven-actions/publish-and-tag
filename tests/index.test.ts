import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { action } from '../src/main.js'
import { createMockOctokit, type MockOctokitMethods } from './helpers.js'
import { type OctokitClient } from '../src/toolkit.js'

describe('publish-and-tag', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods }

  beforeEach(() => {
    octokit = createMockOctokit()
    delete process.env.INPUT_SETUP
    delete process.env.INPUT_TAG_NAME
    delete process.env.INPUT_COMMIT_MESSAGE
    delete process.env.INPUT_LATEST
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('updates the ref and updates an existing major ref', async () => {
    // Setup mocks: first call for v1.2 (exists), second call for v1 (exists)
    octokit.mocks.listMatchingRefs
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1.2' }] })  // v1.2 exists
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1' }] })    // v1 exists

    await action(octokit)

    // updateTag calls updateRef once for v1.2.3
    // createOrUpdateRef calls updateRef twice for v1.2 and v1 (both exist)
    expect(octokit.mocks.updateRef).toHaveBeenCalledTimes(3)
    expect(octokit.mocks.createRef).not.toHaveBeenCalled()
    expect(octokit.mocks.createTree).toHaveBeenCalledTimes(1)
    expect(octokit.mocks.createCommit).toHaveBeenCalledTimes(1)
  })

  it('updates the ref and creates a new major & minor ref', async () => {
    // Setup mocks for non-existing refs
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] })

    await action(octokit)

    // v1.2.3 is updated, v1 and v1.2 are created
    expect(octokit.mocks.updateRef).toHaveBeenCalledTimes(1) // v1.2.3
    expect(octokit.mocks.createRef).toHaveBeenCalledTimes(2) // v1, v1.2
  })

  it('updates the ref with custom tag_name input', async () => {
    octokit.mocks.listMatchingRefs.mockResolvedValue({ data: [] })
    process.env.INPUT_TAG_NAME = 'v2.0.0'

    await action(octokit)

    // Verify the custom tag was used
    expect(octokit.mocks.updateRef).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: 'tags/v2.0.0'
      })
    )
    expect(octokit.mocks.createRef).toHaveBeenCalledTimes(2) // v2, v2.0
  })

  it('updates an existing major ref and makes release latest', async () => {
    octokit.mocks.listMatchingRefs
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1' }] })
      .mockResolvedValueOnce({ data: [{ ref: 'tags/v1.2' }] })

    process.env.INPUT_LATEST = 'true'

    await action(octokit)

    // Verify release was made latest
    expect(octokit.mocks.updateRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        release_id: 123,
        make_latest: 'true'
      })
    )
  })
})
