import getTagName from '../src/get-tag-name.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

describe('update-tag', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_TAG_NAME
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('gets the tag from the release payload', () => {
    const result = getTagName(tools)
    expect(result).toBe('v1.2.3')
  })

  it('gets the tag from the release payload', () => {
    process.env.INPUT_TAG_NAME = 'v2.1.1'
    const result = getTagName(tools)
    expect(result).toBe('v2.1.1')
  })

  it('gets the tag from the release payload', () => {
    tools.context.event = 'pizza'
    expect(() => getTagName(tools)).toThrow('No tag_name was found or provided!')
  })
})
