import * as core from '@actions/core'

export default function getRewriteTags(): boolean {
  let result = true
  const rewriteTagsInput = core.getInput('rewrite_tags')

  if (rewriteTagsInput) {
    if (rewriteTagsInput !== 'true' && rewriteTagsInput !== 'false') {
      throw new Error('rewrite_tags is not valid bool value!')
    }

    result = rewriteTagsInput === 'true'
  }

  return result
}
