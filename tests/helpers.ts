import { Octokit } from '@octokit/rest'
import { type OctokitClient } from '../src/toolkit.js'

// Mock octokit for testing - uses @octokit/rest which nock can intercept
export function generateMockOctokit(): OctokitClient {
  return new Octokit({ auth: `token ${process.env.GITHUB_TOKEN || 'test-token'}` })
}

// Re-export context and utilities for tests
export { context, getWorkspace, getPackageJSON, setTestPackageJSON } from '../src/toolkit.js'
