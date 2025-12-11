import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import makeReleaseLatest from '../src/make-release-latest.js'
import { createMockOctokit, type MockOctokitMethods } from './helpers.js'
import { type OctokitClient } from '../src/toolkit.js'

describe('make-release-latest', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods }

  beforeEach(() => {
    octokit = createMockOctokit()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('true', async () => {
    await makeReleaseLatest(octokit, 123)

    expect(octokit.mocks.updateRelease).toHaveBeenCalledWith({
      owner: 'raven-actions',
      repo: 'test',
      release_id: 123,
      prerelease: false,
      make_latest: 'true'
    })
  })
})
