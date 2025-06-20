import { Toolkit } from 'actions-toolkit'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export default async function makeReleaseLatest(tools: Toolkit, releaseId: number): Promise<any> {
  tools.log.info('Making release latest')
  return await tools.github.repos.updateRelease({
    ...tools.context.repo,
    release_id: releaseId,
    prerelease: false,
    make_latest: 'true'
  })
}
