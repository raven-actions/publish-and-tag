import getRewriteTags from '../src/lib/get-rewrite-tags'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'

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
