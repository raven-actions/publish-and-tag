import { Toolkit } from 'actions-toolkit'

export function getGitCommitMessage(tools: Toolkit): string {
  let gitCommitMessage = 'Automatic compilation'
  if (tools.inputs.git_commit_message) {
    tools.log.info(`Using custom git commit message '${tools.inputs.git_commit_message}'`)
    gitCommitMessage = tools.inputs.git_commit_message
  }

  return gitCommitMessage
}

export function getGitAuthorName(tools: Toolkit): string {
  let gitAuthorName = 'github-actions[bot]'
  if (tools.inputs.git_author_name) {
    tools.log.info(`Using custom git author name '${tools.inputs.git_author_name}'`)
    gitAuthorName = tools.inputs.git_author_name
  }

  return gitAuthorName
}

export function getGitAuthorEmail(tools: Toolkit): string {
  let gitAuthorEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  if (tools.inputs.git_author_email) {
    tools.log.info(`Using custom git author email '${tools.inputs.git_author_email}'`)
    gitAuthorEmail = tools.inputs.git_author_email
  }

  return gitAuthorEmail
}

export function getGitCommitterName(tools: Toolkit): string {
  let gitCommitterName = 'github-actions[bot]'
  if (tools.inputs.git_committer_name) {
    tools.log.info(`Using custom git committer name '${tools.inputs.git_committer_name}'`)
    gitCommitterName = tools.inputs.git_committer_name
  }

  return gitCommitterName
}

export function getGitCommitterEmail(tools: Toolkit): string {
  let gitCommitterEmail = '41898282+github-actions[bot]@users.noreply.github.com'
  if (tools.inputs.git_committer_email) {
    tools.log.info(`Using custom git committer email '${tools.inputs.git_committer_email}'`)
    gitCommitterEmail = tools.inputs.git_committer_email
  }

  return gitCommitterEmail
}
