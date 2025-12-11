import { describe, it, expect, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import * as fileHelper from '../src/file-helper.js'
import { getWorkspace } from '../src/toolkit.js'

describe('file-helper', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('write the file', () => {
    const workspace = getWorkspace()
    vi.spyOn(fs, 'writeFileSync').mockReturnValue(undefined)
    expect(fileHelper.writeFile(workspace, 'test.md', 'test')).toBeUndefined()
  })

  it('reads the file and returns the contents', () => {
    const workspace = getWorkspace()
    expect(fileHelper.readFile(workspace, 'README.md')).toBe('# Hello\n')
  })

  it('throws if the file does not exist', () => {
    const workspace = getWorkspace()
    expect(() => fileHelper.readFile(workspace, 'nope')).toThrow('nope does not exist.')
  })

  it('action metadata file exists', () => {
    const workspace = getWorkspace()
    expect(fileHelper.checkActionManifestFile(workspace)).toBe('action.yml')
  })

  it('throws if the action metadata file does not exist', () => {
    const workspace = path.resolve(getWorkspace(), 'dist')
    expect(() => fileHelper.checkActionManifestFile(workspace)).toThrow(`Neither 'action.yml' nor 'action.yaml' exist.`)
  })
})
