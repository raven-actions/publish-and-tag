import { Toolkit } from 'actions-toolkit'
import { readFile, checkActionManifestFile } from './file-helper.js'
import { getFilesFromPackage as defaultGetFilesFromPackage } from './get-from-package.js'

export default async function createCommit(
  tools: Toolkit,
  gitCommitMessage: string,
  gitAuthorName: string,
  gitAuthorEmail: string,
  gitCommitterName: string,
  gitCommitterEmail: string,
  // Optional dependency injection for testing
  getFilesFromPackage: typeof defaultGetFilesFromPackage = defaultGetFilesFromPackage
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
): Promise<any> {
  const { files } = await getFilesFromPackage(tools)
  const actionManifestGitTree = await getActionManifestGitTree(tools)
  const filesGitTree = await getFilesGitTree(tools, files)

  tools.log.info('Creating tree')
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: [...actionManifestGitTree, ...filesGitTree]
  })
  tools.log.complete(`Tree created (${tree.data.sha})`)

  tools.log.info('Creating commit')
  // https://docs.github.com/en/rest/git/commits?apiVersion=2022-11-28#create-a-commit
  const commit = await tools.github.git.createCommit({
    ...tools.context.repo,
    message: gitCommitMessage,
    author: {
      name: gitAuthorName,
      email: gitAuthorEmail
    },
    committer: {
      name: gitCommitterName,
      email: gitCommitterEmail
    },
    tree: tree.data.sha,
    parents: [tools.context.sha]
  })
  tools.log.complete(`Commit created (${commit.data.sha})`)

  return commit.data
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
async function getActionManifestGitTree(tools: Toolkit): Promise<any[]> {
  const actionManifestFile = checkActionManifestFile(tools.workspace)
  tools.log.info('Adding action metadata file to the git tree')
  return [
    {
      path: actionManifestFile,
      mode: '100644',
      type: 'blob',
      content: readFile(tools.workspace, actionManifestFile)
    }
  ]
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
async function getFilesGitTree(tools: Toolkit, files: string[]): Promise<any[]> {
  tools.log.info('Adding files to the git tree')
  return Promise.all(
    files.map(async (fileName) => ({
      path: fileName,
      mode: fileName.endsWith('.sh') || fileName.endsWith('.bash') ? '100755' : '100644',
      type: 'blob',
      content: readFile(tools.workspace, fileName)
    }))
  )
}
