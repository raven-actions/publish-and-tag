import fs from 'fs'
import path from 'path'
import * as fileHelper from '../src/lib/file-helper'
import {Toolkit} from 'actions-toolkit'
import {generateToolkit} from './helpers'

describe('file-helper', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('write the file', () => {
    jest.spyOn(fs, 'writeFileSync').mockReturnValue(undefined)
    expect(fileHelper.writeFile(tools.workspace, 'test.md', 'test')).toBeUndefined()
  })

  it('reads the file and returns the contents', () => {
    expect(fileHelper.readFile(tools.workspace, 'README.md')).toBe('# Hello\n')
  })

  it('throws if the file does not exist', () => {
    expect(() => fileHelper.readFile(tools.workspace, 'nope')).toThrowError('nope does not exist.')
  })

  it('action metadata file exists', () => {
    expect(fileHelper.checkActionManifestFile(tools.workspace)).toBe('action.yml')
  })

  it('throws if the action metadata file does not exist', () => {
    tools.workspace = path.resolve(tools.workspace, 'dist')
    expect(() => fileHelper.checkActionManifestFile(tools.workspace)).toThrowError(`Neither 'action.yml' nor 'action.yaml' exist.`)
  })
})
