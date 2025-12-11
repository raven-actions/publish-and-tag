import * as core from '@actions/core'
import { context, type OctokitClient } from './toolkit.js'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export default async function makeReleaseLatest(octokit: OctokitClient, releaseId: number): Promise<any> {
  core.info('Making release latest')
  return await octokit.rest.repos.updateRelease({
    ...context.repo,
    release_id: releaseId,
    prerelease: false,
    make_latest: 'true'
  })
}
