import getCleanupManifest from '../src/get-cleanup-manifest.js'
import { jest } from '@jest/globals'

describe('get-cleanup-manifest', () => {
  beforeEach(() => {
    delete process.env.INPUT_CLEANUP_MANIFEST
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('default', () => {
    expect(getCleanupManifest()).toBeFalsy()
  })

  it('empty', () => {
    process.env.INPUT_CLEANUP_MANIFEST = ''
    expect(getCleanupManifest()).toBeFalsy()
  })

  it('true', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'true'
    expect(getCleanupManifest()).toBeTruthy()
  })

  it('false', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'false'
    expect(getCleanupManifest()).toBeFalsy()
  })

  it('not bool value', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'test'
    expect(() => getCleanupManifest()).toThrow('cleanup_manifest is not valid bool value!')
  })
})
