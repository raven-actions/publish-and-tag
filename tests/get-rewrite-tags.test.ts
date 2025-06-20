import getRewriteTags from '../src/get-rewrite-tags.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

describe('get-rewrite-tags', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_REWRITE_TAGS
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('default', () => {
    expect(getRewriteTags(tools)).toBeTruthy()
  })

  it('empty', () => {
    process.env.INPUT_REWRITE_TAGS = ''
    expect(getRewriteTags(tools)).toBeTruthy()
  })

  it('true', () => {
    process.env.INPUT_REWRITE_TAGS = 'true'
    expect(getRewriteTags(tools)).toBeTruthy()
  })

  it('false', () => {
    process.env.INPUT_REWRITE_TAGS = 'false'
    expect(getRewriteTags(tools)).toBeFalsy()
  })

  it('not bool value', () => {
    process.env.INPUT_REWRITE_TAGS = 'test'
    expect(() => getRewriteTags(tools)).toThrow('rewrite_tags is not valid bool value!')
  })
})
