import { Toolkit } from 'actions-toolkit'

export default function getMakeLatest(tools: Toolkit): boolean {
  let result = false

  if (tools.inputs.latest) {
    if (tools.inputs.latest !== 'true' && tools.inputs.latest !== 'false') {
      throw new Error('latest is not valid bool value!')
    }

    result = tools.inputs.latest === 'true' ? true : false
  }

  return result
}
