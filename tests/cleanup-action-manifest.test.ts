import fs from 'fs'
import path from 'path'
import {Toolkit} from 'actions-toolkit'
import {generateToolkit} from './helpers'
import * as fileHelper from '../src/lib/file-helper'
import cleanupActionManifest from '../src/lib/cleanup-action-manifest'

describe('cleanup-action-manifest', () => {
  let tools: Toolkit

  beforeEach(() => {
    jest.spyOn(fileHelper, 'writeFile').mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('should not update the runs property when mainFromPackage is composite', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite')
    tools = generateToolkit()

    const sourceActionManifest = fs.readFileSync(path.resolve(tools.workspace, 'action.yml'), 'utf8')
    await cleanupActionManifest(tools)
    expect(fileHelper.writeFile).toHaveBeenCalledWith(tools.workspace, 'action.yml', sourceActionManifest)
  })

  it('should not update the runs property when mainFromPackage is docker', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'docker')
    tools = generateToolkit()

    const sourceActionManifest = fs.readFileSync(path.resolve(tools.workspace, 'action.yml'), 'utf8')

    await cleanupActionManifest(tools)
    expect(fileHelper.writeFile).toHaveBeenCalledWith(tools.workspace, 'action.yml', sourceActionManifest)
  })

  it('should update the runs property when mainFromPackage is javascript', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'javascript-cleanup')
    tools = generateToolkit()

    const sourceActionManifest = fs.readFileSync(path.resolve(tools.workspace, 'action-expected.yml'), 'utf8')

    await cleanupActionManifest(tools)
    expect(fileHelper.writeFile).toHaveBeenCalledWith(tools.workspace, 'action.yml', sourceActionManifest)
  })

  it('should throw an error when the YAML is invalid', async () => {
    jest.spyOn(fileHelper, 'readFile').mockReturnValue('test: {')
    await expect(cleanupActionManifest(tools)).rejects.toThrow(/Unable to parse Action Manifest file/)
  })

  it('should throw an error when the YAML is not an object', async () => {
    jest.spyOn(fileHelper, 'readFile').mockReturnValue('not an object')
    await expect(cleanupActionManifest(tools)).rejects.toThrow(/does not contain valid YAML object/)
  })
})
