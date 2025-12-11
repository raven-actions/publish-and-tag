import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getWorkspace } from '../src/toolkit.js'
import cleanupActionManifest from '../src/cleanup-action-manifest.js'
import { jest } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('cleanup-action-manifest', () => {
  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('should not update the runs property when mainFromPackage is composite', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite')
    const workspace = getWorkspace()

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8')

    // Create mock functions
    const mockReadFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string) => string>
    const mockWriteFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string, content: string) => void>

    mockReadFile.mockReturnValue(sourceActionManifest)

    await cleanupActionManifest(mockReadFile, mockWriteFile)

    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest)
  })

  it('should not update the runs property when mainFromPackage is docker', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'docker')
    const workspace = getWorkspace()

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8')

    // Create mock functions
    const mockReadFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string) => string>
    const mockWriteFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string, content: string) => void>

    mockReadFile.mockReturnValue(sourceActionManifest)

    await cleanupActionManifest(mockReadFile, mockWriteFile)
    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest)
  })

  it('should update the runs property when mainFromPackage is javascript', async () => {
    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'javascript-cleanup')
    const workspace = getWorkspace()

    const sourceActionManifest = fs.readFileSync(path.resolve(workspace, 'action-expected.yml'), 'utf8')
    const originalActionManifest = fs.readFileSync(path.resolve(workspace, 'action.yml'), 'utf8')

    // Create mock functions
    const mockReadFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string) => string>
    const mockWriteFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string, content: string) => void>

    mockReadFile.mockReturnValue(originalActionManifest)

    await cleanupActionManifest(mockReadFile, mockWriteFile)
    expect(mockWriteFile).toHaveBeenCalledWith(workspace, 'action.yml', sourceActionManifest)
  })

  it('should throw an error when the YAML is invalid', async () => {
    // Create mock functions
    const mockReadFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string) => string>
    const mockWriteFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string, content: string) => void>

    mockReadFile.mockReturnValue('test: {')

    await expect(cleanupActionManifest(mockReadFile, mockWriteFile)).rejects.toThrow(/Unable to parse Action Manifest file/)
  })

  it('should throw an error when the YAML is not an object', async () => {
    // Create mock functions
    const mockReadFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string) => string>
    const mockWriteFile = jest.fn() as jest.MockedFunction<(baseDir: string, file: string, content: string) => void>

    mockReadFile.mockReturnValue('not an object')

    await expect(cleanupActionManifest(mockReadFile, mockWriteFile)).rejects.toThrow(/does not contain valid YAML object/)
  })
})
