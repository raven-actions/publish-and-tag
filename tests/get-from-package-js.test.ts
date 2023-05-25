import path from 'path'
import * as core from '@actions/core'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'
import {getMainFromPackage, getFilesFromPackage} from '../src/lib/get-from-package'

describe('get-from-package (JavaScript Action)', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({main: core.toPlatformPath('dist/index.js')})
    const result = await getMainFromPackage(tools)
    expect(result).toBe(core.toPlatformPath('dist/index.js'))
  })

  it('files - only main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({main: core.toPlatformPath('dist/index.js')})
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/index.js'))).toBeTruthy()
  })

  it('files - only additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({files: [core.toPlatformPath('dist/index.js'), core.toPlatformPath('README.md')]})
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(2)
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/index.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('README.md'))).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({})
    await expect(async () => getFilesFromPackage(tools)).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(5)
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/index.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/additional.js'))).toBeTruthy()
  })

  it('files - main and additional files with * glob', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'glob')
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(5)
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/index.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/additional.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/cleanup.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/setup.js'))).toBeTruthy()
  })
})
