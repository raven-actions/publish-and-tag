import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import nock from 'nock'
import updateTag from '../src/update-tag.js'
import { createMockOctokit } from './helpers.js'
import { type OctokitClient } from '../src/toolkit.js'

describe('update-tag', () => {
  let octokit: OctokitClient
  let params: any

  beforeEach(() => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.0.0')
      .reply(200, (_, body) => {
        params = body
      })

    octokit = createMockOctokit()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('updates the tag', async () => {
    await updateTag(octokit, '123abc', 'v1.0.0')

    expect(nock.isDone()).toBeTruthy()
    expect(params).toEqual({
      force: true,
      sha: '123abc'
    })
  })
})
