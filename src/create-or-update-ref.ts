import * as core from '@actions/core'
import { context, type OctokitClient } from './toolkit.js'

export default async function createOrUpdateRef(octokit: OctokitClient, sha: string, tagName: string): Promise<void> {
  const refName = `tags/v${tagName}`
  core.info(`Updating major version tag ${refName}`)
  const { data: matchingRefs } = await octokit.rest.git.listMatchingRefs({
    ...context.repo,
    ref: refName
  })

  const matchingRef = matchingRefs.find((refObj) => {
    return refObj.ref.endsWith(refName)
  })

  if (matchingRef !== undefined) {
    await octokit.rest.git.updateRef({
      ...context.repo,
      force: true,
      ref: refName,
      sha
    })
  } else {
    await octokit.rest.git.createRef({
      ...context.repo,
      ref: `refs/${refName}`,
      sha
    })
  }
}
