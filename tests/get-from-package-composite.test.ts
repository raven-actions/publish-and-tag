import path from 'path'
import { fileURLToPath } from 'url'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js'
import { jest } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('get-from-package (Composite Action)', () => {
  let tools: Toolkit

  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite')
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: 'composite' })
    const result = await getMainFromPackage(tools)
    expect(result).toBe('composite')
  })

  it('files - only main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: 'composite' })
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(0)
  })

  it('files - only additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ files: ['entrypoint.sh'] })
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({})
    await expect(async () => getFilesFromPackage(tools)).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(4)
    expect(result.files?.some((obj: any) => obj === 'main.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'configs/config.yaml')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'configs/config.yml')).toBeTruthy()
  })
})
