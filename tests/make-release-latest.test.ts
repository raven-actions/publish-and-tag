import nock from 'nock'
import makeReleaseLatest from '../src/make-release-latest.js'
import { generateMockOctokit } from './helpers.js'
import { type OctokitClient } from '../src/toolkit.js'
import { jest } from '@jest/globals'

describe('make-release-latest', () => {
  let octokit: OctokitClient

  beforeEach(() => {
    octokit = generateMockOctokit()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('true', async () => {
    let params: any

    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/releases/123')
      .reply(200, (_, body) => {
        params = body
      })

    await makeReleaseLatest(octokit, 123)
    expect(nock.isDone()).toBeTruthy()
    expect(params.make_latest).toBeTruthy()
  })
})
