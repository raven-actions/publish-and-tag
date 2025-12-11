import * as core from '@actions/core'
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
import { context, getOctokit, type OctokitClient } from './toolkit.js'

export async function action(octokit: OctokitClient): Promise<void> {
  // Get the tag to update
  const tagName = getTagName()
  core.info(`Updating tag [${tagName}]`)

  // Get rewrite tags
  const rewriteTags = getRewriteTags()
  core.info(`Should rewrite major and minor tags? [${rewriteTags}]`)

  // Get make latest
  const makeLatest = getMakeLatest()
  core.info(`Should make release latest? [${makeLatest}]`)

  // Get cleanup manifest
  const cleanupManifest = getCleanupManifest()
  core.info(`Should cleanup action manifest? [${cleanupManifest}]`)

  // Create a new commit, with the new tree
  const gitCommitMessage = getGit.getGitCommitMessage()
  const gitAuthorName = getGit.getGitAuthorName()
  const gitAuthorEmail = getGit.getGitAuthorEmail()
  const gitCommitterName = getGit.getGitCommitterName()
  const gitCommitterEmail = getGit.getGitCommitterEmail()

  if (cleanupManifest) {
    await cleanupActionManifest()
  }

  const commit = await createCommit(octokit, gitCommitMessage, gitAuthorName, gitAuthorEmail, gitCommitterName, gitCommitterEmail)

  // Update the tag to point to the new commit
  await updateTag(octokit, commit.sha, tagName)

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
  if (context.eventName === 'release') {
    const payload = context.payload as { release: { id: number; draft: boolean; prerelease: boolean; html_url: string; make_latest: string } }
    const { id, draft, prerelease, html_url } = payload.release
    releaseId = id

    if ((draft || prerelease) && !makeLatest) {
      shouldRewriteMajorAndMinorRef = false
    }

    if (!draft && makeLatest) {
      shouldMakeLatest = true
    }

    core.setOutput('release_id', id.toString())
    core.setOutput('release_draft', draft.toString())
    core.setOutput('release_prerelease', prerelease.toString())
    core.setOutput('release_latest', shouldMakeLatest ? shouldMakeLatest.toString() : payload.release.make_latest)
    core.setOutput('release_url', html_url.toString())
  }

  if (shouldRewriteMajorAndMinorRef) {
    await createOrUpdateRef(octokit, commit.sha, `${semverMajorStr}.${semverMinorStr}`)
    await createOrUpdateRef(octokit, commit.sha, semverMajorStr)
  }

  // Make release latest
  if (shouldMakeLatest) {
    await makeReleaseLatest(octokit, releaseId)
  }

  // Set outputs
  core.setOutput('commit_sha', commit.sha)
  core.setOutput('semver', semverStr ? semverStr : '')
  core.setOutput('semver_major', semverMajorStr ? semverMajorStr : '')
  core.setOutput('semver_minor', semverMinorStr ? semverMinorStr : '')
  core.setOutput('semver_patch', semverPatchStr ? semverPatchStr : '')
}

export async function run(): Promise<void> {
  try {
    const octokit = getOctokit()
    await action(octokit)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
