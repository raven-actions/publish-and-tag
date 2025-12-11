import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import updateTag from '../src/update-tag.js'
import { createMockOctokit, type MockOctokitMethods } from './helpers.js'
import { type OctokitClient } from '../src/toolkit.js'

describe('update-tag', () => {
  let octokit: OctokitClient & { mocks: MockOctokitMethods }

  beforeEach(() => {
    octokit = createMockOctokit()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('updates the tag', async () => {
    await updateTag(octokit, '123abc', 'v1.0.0')

    expect(octokit.mocks.updateRef).toHaveBeenCalledWith({
      owner: 'raven-actions',
      repo: 'test',
      ref: 'tags/v1.0.0',
      force: true,
      sha: '123abc'
    })
  })
})
