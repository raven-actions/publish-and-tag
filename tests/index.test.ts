import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import nock from 'nock'
import { action } from '../src/main.js'
import { createMockOctokit, type OctokitClient } from './helpers.js'

describe('publish-and-tag', () => {
  let octokit: OctokitClient

  beforeEach(() => {
    nock.cleanAll()
    octokit = createMockOctokit()
    delete process.env.INPUT_SETUP
    delete process.env.INPUT_TAG_NAME
    delete process.env.INPUT_COMMIT_MESSAGE
    delete process.env.INPUT_LATEST
  })

  afterEach(() => {
    nock.cleanAll()
  })

  it('updates the ref and updates an existing major ref', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2.3')
      .reply(200)
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1')
      .reply(200)
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2')
      .reply(200)
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1.2')
      .reply(200, [{ ref: 'tags/v1.2' }])
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { sha: '123abc' })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, { sha: '456def' })

    await action(octokit)

    expect(nock.isDone()).toBeTruthy()
  })

  it('updates the ref and creates a new major & minor ref', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2.3')
      .reply(200)
      .post('/repos/raven-actions/test/git/refs')
      .times(2)
      .reply(200)
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1')
      .reply(200, [])
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1.2')
      .reply(200, [])
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { sha: '123abc' })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, { sha: '456def' })

    await action(octokit)

    expect(nock.isDone()).toBeTruthy()
  })

  // Note: Tests that manipulate context.payload at runtime are skipped
  // because @actions/github.context reads the payload from GITHUB_EVENT_PATH at import time.
  // To test these scenarios, create separate fixture files and update GITHUB_EVENT_PATH.

  it('updates the ref with custom tag_name input', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv2.0.0')
      .reply(200)
      .post('/repos/raven-actions/test/git/refs')
      .times(2)
      .reply(200)
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv2')
      .reply(200, [])
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv2.0')
      .reply(200, [])
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { sha: '123abc' })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, { sha: '456def' })

    process.env.INPUT_TAG_NAME = 'v2.0.0'

    await action(octokit)

    expect(nock.isDone()).toBeTruthy()
  })

  it('updates an existing major ref and makes release latest', async () => {
    let params: unknown

    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/releases/123')
      .reply(200, (_, body) => {
        params = body
      })
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2.3')
      .reply(200)
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1')
      .reply(200)
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2')
      .reply(200)
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1.2')
      .reply(200, [{ ref: 'tags/v1.2' }])
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { sha: '123abc' })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, { sha: '456def' })

    process.env.INPUT_LATEST = 'true'

    await action(octokit)
    expect((params as { make_latest: unknown }).make_latest).toBeTruthy()
    expect(nock.isDone()).toBeTruthy()
  })
})
