import { Octokit } from '@octokit/rest'
import type { OctokitClient } from '../src/toolkit.js'

/**
 * Creates a mock Octokit client for testing
 * Uses @octokit/rest which nock can intercept
 */
export function createMockOctokit(): OctokitClient {
  return new Octokit({ auth: `token ${process.env.GITHUB_TOKEN ?? 'test-token'}` })
}

// Re-export utilities for tests
export { context, getWorkspace, getPackageJSON, setTestPackageJSON } from '../src/toolkit.js'
export type { OctokitClient } from '../src/toolkit.js'
