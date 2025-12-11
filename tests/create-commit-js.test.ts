import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import nock from 'nock'
import createCommit from '../src/create-commit.js'
import { createMockOctokit } from './helpers.js'
import { context, type OctokitClient } from '../src/toolkit.js'

describe('create-commit (JavaScript Action)', () => {
  let octokit: OctokitClient
  let treeParams: any
  let commitParams: any
  let gitCommitMessage: string
  let gitAuthorName: string
  let gitAuthorEmail: string
  let gitCommitterName: string
  let gitCommitterEmail: string

  beforeEach(() => {
    nock('https://api.github.com')
      .post('/repos/raven-actions/test/git/commits')
      .reply(200, (_, body) => {
        commitParams = body
        return { sha: '123abc' }
      })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, (_, body) => {
        treeParams = body
        return { sha: '456def' }
      })

    octokit = createMockOctokit()
    gitCommitMessage = 'Automatic compilation'
    gitAuthorName = 'github-actions[bot]'
    gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com'
    gitCommitterName = 'github-actions[bot]'
    gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com'

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('creates the tree and commit - only main', async () => {
    const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>()
    mockGetFilesFromPackage.mockResolvedValue({ files: ['dist/index.js'] })

    await createCommit(octokit, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail, mockGetFilesFromPackage)
    expect(nock.isDone()).toBeTruthy()

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(2)
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/index.js')).toBeTruthy()

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([context.sha])
  })

  it('creates the tree - only files', async () => {
    const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>()
    mockGetFilesFromPackage.mockResolvedValue({
      files: ['README.md', 'dist/additional.js']
    })

    await createCommit(octokit, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail, mockGetFilesFromPackage)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'README.md')).toBeTruthy()
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/additional.js')).toBeTruthy()
  })

  it('creates the tree - main and files', async () => {
    const mockGetFilesFromPackage = vi.fn<() => Promise<{ files: string[] }>>()
    mockGetFilesFromPackage.mockResolvedValue({
      files: ['README.md', 'dist/additional.js', 'dist/cleanup.js', 'dist/index.js', 'dist/setup.js']
    })

    await createCommit(octokit, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail, mockGetFilesFromPackage)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(6)
  })
})
