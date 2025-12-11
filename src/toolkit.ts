/**
 * Minimal toolkit adapter replacing the actions-toolkit package
 * Uses native @actions/core, @actions/github (for context), and @octokit/rest
 */
import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';

// Re-export context from @actions/github
export const context = github.context;

/**
 * Type for the Octokit client
 */
export type OctokitClient = Octokit;

/**
 * Get an authenticated Octokit client
 * Uses @octokit/rest directly (not @actions/github) for nock compatibility
 */
export function getOctokit(token?: string): OctokitClient {
  const resolvedToken = token || core.getInput('github_token') || process.env['GITHUB_TOKEN'];
  if (!resolvedToken) {
    throw new Error('No GitHub token provided');
  }
  return new Octokit({ auth: `token ${resolvedToken}` });
}

/**
 * Get the workspace path
 */
export function getWorkspace(): string {
  return process.env['GITHUB_WORKSPACE'] || process.cwd();
}

/**
 * Get the package.json from the workspace
 * Can be overridden for testing by setting _testPackageJSON
 */
let _testPackageJSON: object | undefined;

export function setTestPackageJSON(pkg: object | undefined): void {
  _testPackageJSON = pkg;
}

export function getPackageJSON<T = object>(): T {
  if (_testPackageJSON) {
    return _testPackageJSON as T;
  }
  const workspace = getWorkspace();
  const pathToPackage = path.join(workspace, 'package.json');
  if (!fs.existsSync(pathToPackage)) {
    throw new Error("package.json could not be found in your project's root.");
  }
  return JSON.parse(fs.readFileSync(pathToPackage, 'utf8'));
}
