import * as core from '@actions/core';
import { context, type OctokitClient } from './toolkit.js';

export default async function makeReleaseLatest(octokit: OctokitClient, releaseId: number): Promise<void> {
  core.info('Making release latest');
  await octokit.rest.repos.updateRelease({
    ...context.repo,
    release_id: releaseId,
    prerelease: false,
    make_latest: 'true'
  });
}
