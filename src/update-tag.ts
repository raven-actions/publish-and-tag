import * as core from '@actions/core'
import { context, type OctokitClient } from './toolkit.js'

export default async function updateTag(octokit: OctokitClient, sha: string, tagName: string): Promise<void> {
  const ref = `tags/${tagName}`

  core.info(`Updating ${ref}`)
  await octokit.rest.git.updateRef({
    ...context.repo,
    ref,
    force: true,
    sha
  })
}
