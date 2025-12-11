import * as core from '@actions/core'

/**
 * Helper to get a git config input with a default value
 */
function getGitInput(inputName: string, defaultValue: string, description: string): string {
  const input = core.getInput(inputName)
  if (input) {
    core.info(`Using custom ${description} '${input}'`)
    return input
  }
  return defaultValue
}

const DEFAULT_BOT_NAME = 'github-actions[bot]'
const DEFAULT_BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com'

export function getGitCommitMessage(): string {
  return getGitInput('git_commit_message', 'Automatic compilation', 'git commit message')
}

export function getGitAuthorName(): string {
  return getGitInput('git_author_name', DEFAULT_BOT_NAME, 'git author name')
}

export function getGitAuthorEmail(): string {
  return getGitInput('git_author_email', DEFAULT_BOT_EMAIL, 'git author email')
}

export function getGitCommitterName(): string {
  return getGitInput('git_committer_name', DEFAULT_BOT_NAME, 'git committer name')
}

export function getGitCommitterEmail(): string {
  return getGitInput('git_committer_email', DEFAULT_BOT_EMAIL, 'git committer email')
}
