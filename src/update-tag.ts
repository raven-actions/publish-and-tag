import * as core from '@actions/core'
import { context, type OctokitClient } from './toolkit.js'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export default async function updateTag(octokit: OctokitClient, sha: string, tagName: string): Promise<any> {
  const ref = `tags/${tagName}`

  core.info(`Updating ${ref}`)
  return octokit.rest.git.updateRef({
    ...context.repo,
    ref,
    force: true,
    sha
  })
}
