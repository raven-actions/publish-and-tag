import nock from 'nock'
import createOrUpdateRef from '../src/create-or-update-ref.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

describe('create-or-update-ref', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('updates the major ref if it already exists', async () => {
    nock('https://api.github.com')
      .patch('/repos/raven-actions/test/git/refs/tags%2Fv1')
      .reply(200)
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])

    await createOrUpdateRef(tools, '123abc', '1')

    expect(nock.isDone()).toBeTruthy()
  })

  it('creates a new major ref if it does not already exist', async () => {
    let params: any

    nock('https://api.github.com')
      .post('/repos/raven-actions/test/git/refs')
      .reply(200, (_, body) => {
        params = body
      })
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1')
      .reply(200, [])

    await createOrUpdateRef(tools, '123abc', '1')

    expect(nock.isDone()).toBeTruthy()
    expect(params.ref).toBe('refs/tags/v1')
  })

  it('creates a new minor ref if it does not already exist', async () => {
    let params: any

    nock('https://api.github.com')
      .post('/repos/raven-actions/test/git/refs')
      .reply(200, (_, body) => {
        params = body
      })
      .get('/repos/raven-actions/test/git/matching-refs/tags%2Fv1.0')
      .reply(200, [])

    await createOrUpdateRef(tools, '123abc', '1.0')

    expect(nock.isDone()).toBeTruthy()
    expect(params.ref).toBe('refs/tags/v1.0')
  })
})
