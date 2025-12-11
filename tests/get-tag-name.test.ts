import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the toolkit module before importing get-tag-name
vi.mock('../src/toolkit.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/toolkit.js')>();
  return {
    ...original,
    context: {
      ...original.context,
      eventName: 'release',
      payload: {
        release: {
          tag_name: 'v1.2.3'
        }
      }
    }
  };
});

import getTagName from '../src/get-tag-name.js';

describe('get-tag-name', () => {
  beforeEach(() => {
    delete process.env['INPUT_TAG_NAME'];
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('gets the tag from the release payload', () => {
    const result = getTagName();
    expect(result).toBe('v1.2.3');
  });

  it('gets the tag from the input', () => {
    process.env['INPUT_TAG_NAME'] = 'v2.1.1';
    const result = getTagName();
    expect(result).toBe('v2.1.1');
  });

  it('throws when eventName is not release and no input provided', async () => {
    // Reset modules and re-mock with non-release event
    vi.resetModules();
    vi.doMock('../src/toolkit.js', async (importOriginal) => {
      const original = await importOriginal<typeof import('../src/toolkit.js')>();
      return {
        ...original,
        context: {
          ...original.context,
          eventName: 'push',
          payload: {}
        }
      };
    });

    const { default: getTagNameFresh } = await import('../src/get-tag-name.js');
    expect(() => getTagNameFresh()).toThrow('No tag_name was found or provided!');
  });
});
