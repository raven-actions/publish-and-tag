import { Toolkit } from 'actions-toolkit'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export default async function updateTag(tools: Toolkit, sha: string, tagName: string): Promise<any> {
  const ref = `tags/${tagName}`

  tools.log.info(`Updating ${ref}`)
  return tools.github.git.updateRef({
    ...tools.context.repo,
    ref,
    force: true,
    sha
  })
}
