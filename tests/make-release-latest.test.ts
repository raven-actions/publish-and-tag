import nock from 'nock'
import makeReleaseLatest from '../src/lib/make-release-latest'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'

describe('make-release-latest', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
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

    await makeReleaseLatest(tools, 123)
    expect(nock.isDone()).toBeTruthy()
    expect(params.make_latest).toBeTruthy()
  })
})
