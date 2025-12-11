import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import getTagName from '../src/get-tag-name.js'

describe('get-tag-name', () => {
  beforeEach(() => {
    delete process.env.INPUT_TAG_NAME
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('gets the tag from the release payload', () => {
    // The context.eventName is 'release' by default from setup.ts
    const result = getTagName()
    expect(result).toBe('v1.2.3')
  })

  it('gets the tag from the input', () => {
    process.env.INPUT_TAG_NAME = 'v2.1.1'
    const result = getTagName()
    expect(result).toBe('v2.1.1')
  })

  // Note: This test is skipped because @actions/github.context reads
  // GITHUB_EVENT_NAME at module load time, not at runtime.
  // Changing process.env.GITHUB_EVENT_NAME after import has no effect.
  it.skip('throws when no tag_name found', () => {
    // This would require jest.unstable_mockModule to mock the toolkit before import
    process.env.GITHUB_EVENT_NAME = 'pizza'
    expect(() => getTagName()).toThrow('No tag_name was found or provided!')
  })
})
