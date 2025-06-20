import nock from 'nock'
import path from 'path'
import { fileURLToPath } from 'url'
import createCommit from '../src/create-commit.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('create-commit (Composite Action)', () => {
  let tools: Toolkit
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
      })
      .post('/repos/raven-actions/test/git/trees')
      .reply(200, (_, body) => {
        treeParams = body
      })

    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'composite')
    tools = generateToolkit()
    gitCommitMessage = 'Automatic compilation'
    gitAuthorName = 'github-actions[bot]'
    gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com'
    gitCommitterName = 'github-actions[bot]'
    gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  })

  afterEach(() => {
    jest.resetAllMocks()
    delete process.env.GITHUB_WORKSPACE
  })

  it('chmod', async () => {
    const mockGetFilesFromPackage = jest.fn() as jest.MockedFunction<(tools: Toolkit) => Promise<{ files: string[] }>>
    mockGetFilesFromPackage.mockResolvedValue({
      files: ['entrypoint.sh', 'main.js']
    })

    await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail, mockGetFilesFromPackage)

    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])

    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'entrypoint.sh' && obj.mode === '100755')).toBeTruthy()
    expect(treeParams.tree.some((obj: any) => obj.path === 'main.js' && obj.mode === '100644')).toBeTruthy()
  })
})
