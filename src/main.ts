import { Toolkit } from 'actions-toolkit'
import semver from 'semver'
import createOrUpdateRef from './create-or-update-ref.js'
import createCommit from './create-commit.js'
import updateTag from './update-tag.js'
import makeReleaseLatest from './make-release-latest.js'
import getTagName from './get-tag-name.js'
import * as getGit from './get-git.js'
import getRewriteTags from './get-rewrite-tags.js'
import getMakeLatest from './get-make-latest.js'
import getCleanupManifest from './get-cleanup-manifest.js'
import cleanupActionManifest from './cleanup-action-manifest.js'

export async function action(tools: Toolkit): Promise<void> {
  // Get the tag to update
  const tagName = getTagName(tools)
  tools.log.info(`Updating tag [${tagName}]`)

  // Get rewrite tags
  const rewriteTags = getRewriteTags(tools)
  tools.log.info(`Should rewrite major and minor tags? [${rewriteTags}]`)

  // Get make latest
  const makeLatest = getMakeLatest(tools)
  tools.log.info(`Should make release latest? [${makeLatest}]`)

  // Get cleanup manifest
  const cleanupManifest = getCleanupManifest(tools)
  tools.log.info(`Should cleanup action manifest? [${cleanupManifest}]`)

  // Create a new commit, with the new tree
  const gitCommitMessage = getGit.getGitCommitMessage(tools)
  const gitAuthorName = getGit.getGitAuthorName(tools)
  const gitAuthorEmail = getGit.getGitAuthorEmail(tools)
  const gitCommitterName = getGit.getGitCommitterName(tools)
  const gitCommitterEmail = getGit.getGitCommitterEmail(tools)

  if (cleanupManifest) {
    await cleanupActionManifest(tools)
  }

  const commit = await createCommit(tools, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)

  // Update the tag to point to the new commit
  await updateTag(tools, commit.sha, tagName)

  // Also update the major version tag.
  // For example, for version v1.0.0, we'd also update v1.
  let shouldRewriteMajorAndMinorRef = rewriteTags
  const semverStr = semver.valid(tagName)
  const semverMajorStr = semver.major(tagName).toString()
  const semverMinorStr = semver.minor(tagName).toString()
  const semverPatchStr = semver.patch(tagName).toString()
  let shouldMakeLatest = false
  let releaseId = 0

  // If this is a release event, only update the major ref for a full release.
  if (tools.context.event === 'release') {
    const { id, draft, prerelease, html_url } = tools.context.payload.release
    releaseId = id

    if ((draft || prerelease) && !makeLatest) {
      shouldRewriteMajorAndMinorRef = false
    }

    if (!draft && makeLatest) {
      shouldMakeLatest = true
    }

    tools.outputs.release_id = id.toString()
    tools.outputs.release_draft = draft.toString()
    tools.outputs.release_prerelease = prerelease.toString()
    tools.outputs.release_latest = shouldMakeLatest ? shouldMakeLatest.toString() : tools.context.payload.release.make_latest
    tools.outputs.release_url = html_url.toString()
  }

  if (shouldRewriteMajorAndMinorRef) {
    await createOrUpdateRef(tools, commit.sha, `${semverMajorStr}.${semverMinorStr}`)
    await createOrUpdateRef(tools, commit.sha, semverMajorStr)
  }

  // Make release latest
  if (shouldMakeLatest) {
    await makeReleaseLatest(tools, releaseId)
  }

  // Set outputs
  tools.outputs.commit_sha = commit.sha
  tools.outputs.semver = semverStr ? semverStr : ''
  tools.outputs.semver_major = semverMajorStr ? semverMajorStr : ''
  tools.outputs.semver_minor = semverMinorStr ? semverMinorStr : ''
  tools.outputs.semver_patch = semverPatchStr ? semverPatchStr : ''
}

export async function run(): Promise<void> {
  await action(new Toolkit())
}
