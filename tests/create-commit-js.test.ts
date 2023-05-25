import nock from 'nock'
import createCommit from '../src/lib/create-commit'
import {generateToolkit} from './helpers'
import {Toolkit} from 'actions-toolkit'
import * as getFilesFromPackage from '../src/lib/get-from-package'

describe('create-commit (JavaScript Action)', () => {
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

    tools = generateToolkit()
    gitCommitMessage = 'Automatic compilation'
    gitAuthorName = 'github-actions[bot]'
    gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com'
    gitCommitterName = 'github-actions[bot]'
    gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('creates the tree and commit - only main', async () => {
    jest.spyOn(getFilesFromPackage, 'getFilesFromPackage').mockReturnValueOnce(Promise.resolve({files: ['dist/index.js']}))
    await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)
    expect(nock.isDone()).toBeTruthy()

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(2)
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/index.js')).toBeTruthy()

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])
  })

  it('creates the tree - only files', async () => {
    jest.spyOn(getFilesFromPackage, 'getFilesFromPackage').mockReturnValueOnce(
      Promise.resolve({
        files: ['README.md', 'dist/additional.js']
      })
    )
    await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'README.md')).toBeTruthy()
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/additional.js')).toBeTruthy()
  })

  it('creates the tree - main and files', async () => {
    await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(6)
  })
})
