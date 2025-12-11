import * as core from '@actions/core'
import { context } from './toolkit.js'

export default function getTagName(): string {
  const tagNameInput = core.getInput('tag_name')
  if (tagNameInput) {
    return tagNameInput
  }

  if (context.eventName === 'release') {
    const payload = context.payload as { release: { tag_name: string } }
    return payload.release.tag_name
  }

  throw new Error('No tag_name was found or provided!')
}
