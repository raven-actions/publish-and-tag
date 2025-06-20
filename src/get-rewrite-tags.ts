import { Toolkit } from 'actions-toolkit'

export default function getRewriteTags(tools: Toolkit): boolean {
  let result = true

  if (tools.inputs.rewrite_tags) {
    if (tools.inputs.rewrite_tags !== 'true' && tools.inputs.rewrite_tags !== 'false') {
      throw new Error('rewrite_tags is not valid bool value!')
    }

    result = tools.inputs.rewrite_tags === 'true' ? true : false
  }

  return result
}
