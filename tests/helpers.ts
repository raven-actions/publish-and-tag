import { vi } from 'vitest';
import type { OctokitClient } from '../src/toolkit.js';

/**
 * Creates a mock Octokit client for testing using Vitest's native mocking
 * This is faster and more explicit than using nock for HTTP interception
 */
export function createMockOctokit(
  overrides?: Partial<MockOctokitMethods>
): OctokitClient & { mocks: MockOctokitMethods } {
  const mocks: MockOctokitMethods = {
    // Git methods
    createTree: vi.fn().mockResolvedValue({ data: { sha: '456def' } }),
    createCommit: vi.fn().mockResolvedValue({ data: { sha: '123abc' } }),
    createRef: vi.fn().mockResolvedValue({ data: {} }),
    updateRef: vi.fn().mockResolvedValue({ data: {} }),
    listMatchingRefs: vi.fn().mockResolvedValue({ data: [] }),
    // Repos methods
    updateRelease: vi.fn().mockResolvedValue({ data: {} }),
    // Apply overrides
    ...overrides
  };

  return {
    rest: {
      git: {
        createTree: mocks.createTree,
        createCommit: mocks.createCommit,
        createRef: mocks.createRef,
        updateRef: mocks.updateRef,
        listMatchingRefs: mocks.listMatchingRefs
      },
      repos: {
        updateRelease: mocks.updateRelease
      }
    },
    mocks
  } as unknown as OctokitClient & { mocks: MockOctokitMethods };
}

export interface MockOctokitMethods {
  createTree: ReturnType<typeof vi.fn>;
  createCommit: ReturnType<typeof vi.fn>;
  createRef: ReturnType<typeof vi.fn>;
  updateRef: ReturnType<typeof vi.fn>;
  listMatchingRefs: ReturnType<typeof vi.fn>;
  updateRelease: ReturnType<typeof vi.fn>;
}

// Re-export utilities for tests
export { context, getWorkspace, getPackageJSON, setTestPackageJSON } from '../src/toolkit.js';
export type { OctokitClient } from '../src/toolkit.js';
