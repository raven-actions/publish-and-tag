import nock from 'nock'
import path from 'path'
import createCommit from '../src/lib/create-commit'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'
import * as getFilesFromPackage from '../src/lib/get-from-package'

describe('create-commit (Docker Action)', () => {
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

    process.env.GITHUB_WORKSPACE = path.resolve(__dirname, 'fixtures', 'workspace', 'docker')
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
    jest.spyOn(getFilesFromPackage, 'getFilesFromPackage').mockReturnValueOnce(
      Promise.resolve({
        files: ['entrypoint.sh', 'Dockerfile']
      })
    )
    await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)

    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])

    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'entrypoint.sh' && obj.mode === '100755')).toBeTruthy()
    expect(treeParams.tree.some((obj: any) => obj.path === 'Dockerfile' && obj.mode === '100644')).toBeTruthy()
  })
})
