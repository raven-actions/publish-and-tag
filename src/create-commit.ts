import * as core from '@actions/core';
import { context, getWorkspace, type OctokitClient } from './toolkit.js';
import { readFile, checkActionManifestFile } from './file-helper.js';
import { getFilesFromPackage as defaultGetFilesFromPackage } from './get-from-package.js';

interface GitCommit {
  sha: string;
  node_id: string;
  url: string;
  html_url: string;
  message: string;
}

export default async function createCommit(
  octokit: OctokitClient,
  gitCommitMessage: string,
  gitAuthorName: string,
  gitAuthorEmail: string,
  gitCommitterName: string,
  gitCommitterEmail: string,
  // Optional dependency injection for testing
  getFilesFromPackage: typeof defaultGetFilesFromPackage = defaultGetFilesFromPackage
): Promise<GitCommit> {
  const workspace = getWorkspace();
  const { files } = await getFilesFromPackage();
  const actionManifestGitTree = getActionManifestGitTree(workspace);
  const filesGitTree = getFilesGitTree(workspace, files);

  core.info('Creating tree');
  const tree = await octokit.rest.git.createTree({
    ...context.repo,
    tree: [...actionManifestGitTree, ...filesGitTree]
  });
  core.info(`✅ Tree created (${tree.data.sha})`);

  core.info('Creating commit');
  // https://docs.github.com/en/rest/git/commits?apiVersion=2022-11-28#create-a-commit
  const commit = await octokit.rest.git.createCommit({
    ...context.repo,
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
    parents: [context.sha]
  });
  core.info(`✅ Commit created (${commit.data.sha})`);

  return commit.data;
}

interface GitTreeItem {
  path: string;
  mode: '100644' | '100755' | '040000' | '160000' | '120000';
  type: 'blob' | 'tree' | 'commit';
  content: string;
}

function getActionManifestGitTree(workspace: string): GitTreeItem[] {
  const actionManifestFile = checkActionManifestFile(workspace);
  core.info('Adding action metadata file to the git tree');
  return [
    {
      path: actionManifestFile,
      mode: '100644',
      type: 'blob',
      content: readFile(workspace, actionManifestFile)
    }
  ];
}

function getFilesGitTree(workspace: string, files: string[]): GitTreeItem[] {
  core.info('Adding files to the git tree');
  return files.map((fileName) => ({
    path: fileName,
    mode: fileName.endsWith('.sh') || fileName.endsWith('.bash') ? '100755' : '100644',
    type: 'blob',
    content: readFile(workspace, fileName)
  }));
}
