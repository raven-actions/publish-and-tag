import path from 'path'
import { fileURLToPath } from 'url'
import { getMainFromPackage, getFilesFromPackage } from '../src/get-from-package.js'
import { jest } from '@jest/globals'
import { setTestPackageJSON } from '../src/toolkit.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('get-from-package (Docker Action)', () => {
  beforeEach(() => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'docker')
  })

  afterEach(() => {
    setTestPackageJSON(undefined)
    jest.restoreAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('main', async () => {
    setTestPackageJSON({ main: 'docker' })
    const result = await getMainFromPackage()
    expect(result).toBe('docker')
  })

  it('files - only main', async () => {
    setTestPackageJSON({ main: 'docker' })
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(0)
  })

  it('files - only additional files', async () => {
    setTestPackageJSON({ files: ['Dockerfile'] })
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(1)
    expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy()
  })

  it('files - no main, no additional files', async () => {
    setTestPackageJSON({})
    await expect(async () => getFilesFromPackage()).rejects.toThrow('Property "main" or "files" do not exist in your `package.json`.')
  })

  it('files - main and additional files with globs', async () => {
    const result = await getFilesFromPackage()
    expect(result.files).toHaveLength(3)
    expect(result.files?.some((obj: any) => obj === 'Dockerfile')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'entrypoint.sh')).toBeTruthy()
    expect(result.files?.some((obj: any) => obj === 'configs/config.yaml')).toBeTruthy()
  })
})
