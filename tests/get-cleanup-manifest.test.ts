import getCleanupManifest from '../src/lib/get-cleanup-manifest'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'

describe('get-make-latest', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_CLEANUP_MANIFEST
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('default', () => {
    expect(getCleanupManifest(tools)).toBeFalsy()
  })

  it('empty', () => {
    process.env.INPUT_CLEANUP_MANIFEST = ''
    expect(getCleanupManifest(tools)).toBeFalsy()
  })

  it('true', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'true'
    expect(getCleanupManifest(tools)).toBeTruthy()
  })

  it('false', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'false'
    expect(getCleanupManifest(tools)).toBeFalsy()
  })

  it('not bool value', () => {
    process.env.INPUT_CLEANUP_MANIFEST = 'test'
    expect(() => getCleanupManifest(tools)).toThrowError('cleanup_manifest is not valid bool value!')
  })
})
