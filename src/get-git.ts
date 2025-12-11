import * as core from '@actions/core'

export function getGitCommitMessage(): string {
  let gitCommitMessage = 'Automatic compilation'
  const input = core.getInput('git_commit_message')
  if (input) {
    core.info(`Using custom git commit message '${input}'`)
    gitCommitMessage = input
  }

  return gitCommitMessage
}

export function getGitAuthorName(): string {
  let gitAuthorName = 'github-actions[bot]'
  const input = core.getInput('git_author_name')
  if (input) {
    core.info(`Using custom git author name '${input}'`)
    gitAuthorName = input
  }

  return gitAuthorName
}

export function getGitAuthorEmail(): string {
  let gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  const input = core.getInput('git_author_email')
  if (input) {
    core.info(`Using custom git author email '${input}'`)
    gitAuthorEmail = input
  }

  return gitAuthorEmail
}

export function getGitCommitterName(): string {
  let gitCommitterName = 'github-actions[bot]'
  const input = core.getInput('git_committer_name')
  if (input) {
    core.info(`Using custom git committer name '${input}'`)
    gitCommitterName = input
  }

  return gitCommitterName
}

export function getGitCommitterEmail(): string {
  let gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  const input = core.getInput('git_committer_email')
  if (input) {
    core.info(`Using custom git committer email '${input}'`)
    gitCommitterEmail = input
  }

  return gitCommitterEmail
}
