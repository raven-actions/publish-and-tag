import nock from 'nock'
import { Toolkit } from 'actions-toolkit'
import { action } from '../src/main.js'
import { generateToolkit } from './helpers.js'
import { jest } from '@jest/globals'

describe('publish-and-tag', () => {
  let tools: Toolkit

  beforeEach(() => {
    nock.cleanAll()
    tools = generateToolkit()
    delete process.env.INPUT_SETUP
    delete process.env.INPUT_TAG_NAME
    delete process.env.INPUT_COMMIT_MESSAGE
    delete process.env.INPUT_LATEST
  })

  afterEach(() => {
    jest.resetAllMocks()
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
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    await action(tools)

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
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    await action(tools)

    expect(nock.isDone()).toBeTruthy()
  })

  it('does not update the major ref if the release is a draft', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2.3')
      .reply(200)
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    tools.context.payload.release.draft = true

    await action(tools)

    expect(nock.isDone()).toBeTruthy()
  })

  it('does not update the major ref if the release is a prerelease', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1.2.3')
      .reply(200)
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    tools.context.payload.release.prerelease = true

    await action(tools)

    expect(nock.isDone()).toBeTruthy()
  })

  it('updates the ref and creates a new major ref for an event other than `release`', async () => {
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
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    tools.context.event = 'pull_request'
    process.env.INPUT_TAG_NAME = 'v2.0.0'

    await action(tools)

    expect(nock.isDone()).toBeTruthy()
  })

  it('updates an existing major ref and make release latest and switch to full release if the release is a prerelease', async () => {
    let params: any

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
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200)

    tools.context.payload.release.draft = false
    tools.context.payload.release.prerelease = true
    process.env.INPUT_LATEST = 'true'

    await action(tools)
    expect(params.make_latest).toBeTruthy()
    expect(nock.isDone()).toBeTruthy()
  })
})
