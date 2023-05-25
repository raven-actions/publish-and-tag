import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'
import {getMainFromPackage, getFilesFromPackage} from '../src/lib/get-from-package'
import path from 'path'
import * as core from '@actions/core'

describe('get-from-package (JavaScript Action)', () => {
  let tools: Toolkit

  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'glob')
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({main: core.toPlatformPath('dist/index.js')})
    const result = await getMainFromPackage(tools)
    expect(result).toBe(core.toPlatformPath('dist/index.js'))
  })

  it('files - main and additional files with * glob', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(6)
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/index.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/additional.js'))).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === core.toPlatformPath('dist/cleanup.js'))).toBeTruthy()
  })
})
