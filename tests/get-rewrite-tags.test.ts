import getRewriteTags from '../src/get-rewrite-tags.js'
import { jest } from '@jest/globals'

describe('get-rewrite-tags', () => {
  beforeEach(() => {
    delete process.env.INPUT_REWRITE_TAGS
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('default', () => {
    expect(getRewriteTags()).toBeTruthy()
  })

  it('empty', () => {
    process.env.INPUT_REWRITE_TAGS = ''
    expect(getRewriteTags()).toBeTruthy()
  })

  it('true', () => {
    process.env.INPUT_REWRITE_TAGS = 'true'
    expect(getRewriteTags()).toBeTruthy()
  })

  it('false', () => {
    process.env.INPUT_REWRITE_TAGS = 'false'
    expect(getRewriteTags()).toBeFalsy()
  })

  it('not bool value', () => {
    process.env.INPUT_REWRITE_TAGS = 'test'
    expect(() => getRewriteTags()).toThrow('rewrite_tags is not valid bool value!')
  })
})
