import path from 'path'
import * as core from '@actions/core'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'
import {getMainFromPackage, getFilesFromPackage} from '../src/lib/get-from-package'

describe('get-from-package (Docker Action)', () => {
  let tools: Toolkit

  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'docker')
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({main: 'docker'})
    const result = await getMainFromPackage(tools)
    expect(result).toBe('docker')
  })

  it('files - only main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({main: 'docker'})
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(0)
  })

  it('files - only additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({files: ['Dockerfile']})
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({})
    await expect(async () => getFilesFromPackage(tools)).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(3)
    expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('configs/config.yaml'))).toBeTruthy()
  })
})
