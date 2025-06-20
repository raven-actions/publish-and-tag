import path from 'path'
import { fileURLToPath } from 'url'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js'
import { jest } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('get-from-package (JavaScript Action)', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: 'dist/index.js' })
    const result = await getMainFromPackage(tools)
    expect(result).toBe('dist/index.js')
  })

  it('files - only main', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: 'dist/index.js' })
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy()
  })

  it('files - only additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ files: ['dist/index.js', 'README.md'] })
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(2)
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'README.md')).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({})
    await expect(async () => getFilesFromPackage(tools)).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(5)
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy()
  })

  it('files - main and additional files with * glob', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'glob')
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(5)
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/cleanup.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/setup.js')).toBeTruthy()
  })
})
