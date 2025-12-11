import path from 'path'
import { fileURLToPath } from 'url'
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js'
import { jest } from '@jest/globals'
import { setTestPackageJSON } from '../src/toolkit.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('get-from-package (Composite Action)', () => {
  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite')
  })

  afterEach(() => {
    setTestPackageJSON(undefined)
    jest.restoreAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('main', async () => {
    setTestPackageJSON({ main: 'composite' })
    const result = await getMainFromPackage()
    expect(result).toBe('composite')
  })

  it('files - only main', async () => {
    setTestPackageJSON({ main: 'composite' })
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(0)
  })

  it('files - only additional files', async () => {
    setTestPackageJSON({ files: ['entrypoint.sh'] })
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    setTestPackageJSON({})
    await expect(async () => getFilesFromPackage()).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(4)
    expect(result.files?.some((obj: any) => obj === 'main.js')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'configs/config.yaml')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'configs/config.yml')).toBeTruthy()
  })
})
