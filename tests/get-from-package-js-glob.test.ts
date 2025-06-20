import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { jest } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: 'dist/index.js' })
    const result = await getMainFromPackage(tools)
    expect(result).toBe('dist/index.js')
  })

  it('files - main and additional files with * glob', async () => {
    const result = await getFilesFromPackage(tools)
    expect(result.files).toHaveLength(6)
    expect(result.files?.some((obj: any) => obj === 'dist/index.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/additional.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'dist/cleanup.js')).toBeTruthy()
  })
})
