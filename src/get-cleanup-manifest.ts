import { Toolkit } from 'actions-toolkit'

export default function getCleanupManifest(tools: Toolkit): boolean {
  let result = false

  if (tools.inputs.cleanup_manifest) {
    if (tools.inputs.cleanup_manifest !== 'true' && tools.inputs.cleanup_manifest !== 'false') {
      throw new Error('cleanup_manifest is not valid bool value!')
    }

    result = tools.inputs.cleanup_manifest === 'true' ? true : false
  }

  return result
}
