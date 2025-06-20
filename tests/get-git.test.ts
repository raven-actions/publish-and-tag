import * as getGit from '../src/get-git.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

describe('get-git', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_GIT_COMMIT_MESSAGE
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  // git_commit_message
  it('git-commit-message - default', () => {
    const result = getGit.getGitCommitMessage(tools)
    expect(result).toBe('Automatic compilation')
  })

  it('git-commit-message - empty', () => {
    process.env.INPUT_GIT_COMMIT_MESSAGE = ''
    const result = getGit.getGitCommitMessage(tools)
    expect(result).toBe('Automatic compilation')
  })

  it('git-commit-message - custom', () => {
    process.env.INPUT_GIT_COMMIT_MESSAGE = 'test commit message'
    const result = getGit.getGitCommitMessage(tools)
    expect(result).toBe('test commit message')
  })

  // git_author_name
  it('git-author-name - default', () => {
    const result = getGit.getGitAuthorName(tools)
    expect(result).toBe('github-actions[bot]')
  })

  it('git-author-name - empty', () => {
    process.env.INPUT_GIT_AUTHOR_NAME = ''
    const result = getGit.getGitAuthorName(tools)
    expect(result).toBe('github-actions[bot]')
  })

  it('git-author-name - custom', () => {
    process.env.INPUT_GIT_AUTHOR_NAME = 'custom-actions[bot]'
    const result = getGit.getGitAuthorName(tools)
    expect(result).toBe('custom-actions[bot]')
  })

  // git_author_email
  it('git-author-email - default', () => {
    const result = getGit.getGitAuthorEmail(tools)
    expect(result).toBe('41898282+github-actions[bot]@users.noreply.github.com')
  })

  it('git-author-email - empty', () => {
    process.env.INPUT_GIT_AUTHOR_EMAIL = ''
    const result = getGit.getGitAuthorEmail(tools)
    expect(result).toBe('41898282+github-actions[bot]@users.noreply.github.com')
  })

  it('git-author-email - custom', () => {
    process.env.INPUT_GIT_AUTHOR_EMAIL = '12345678+custom-actions[bot]@users.noreply.github.com'
    const result = getGit.getGitAuthorEmail(tools)
    expect(result).toBe('12345678+custom-actions[bot]@users.noreply.github.com')
  })

  // git_committer_name
  it('git-committer-name - default', () => {
    const result = getGit.getGitCommitterName(tools)
    expect(result).toBe('github-actions[bot]')
  })

  it('git-committer-name - empty', () => {
    process.env.INPUT_GIT_COMMITTER_NAME = ''
    const result = getGit.getGitCommitterName(tools)
    expect(result).toBe('github-actions[bot]')
  })

  it('git-committer-name - custom', () => {
    process.env.INPUT_GIT_COMMITTER_NAME = 'custom-actions[bot]'
    const result = getGit.getGitCommitterName(tools)
    expect(result).toBe('custom-actions[bot]')
  })

  // git_committer_email
  it('git-committer-email - default', () => {
    const result = getGit.getGitCommitterEmail(tools)
    expect(result).toBe('41898282+github-actions[bot]@users.noreply.github.com')
  })

  it('git-committer-email - empty', () => {
    process.env.INPUT_GIT_COMMITTER_EMAIL = ''
    const result = getGit.getGitCommitterEmail(tools)
    expect(result).toBe('41898282+github-actions[bot]@users.noreply.github.com')
  })

  it('git-committer-email - custom', () => {
    process.env.INPUT_GIT_COMMITTER_EMAIL = '12345678+custom-actions[bot]@users.noreply.github.com'
    const result = getGit.getGitCommitterEmail(tools)
    expect(result).toBe('12345678+custom-actions[bot]@users.noreply.github.com')
  })
})
