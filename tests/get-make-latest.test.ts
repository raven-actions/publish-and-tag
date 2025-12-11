import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import getMakeLatest from '../src/get-make-latest.js';

describe('get-make-latest', () => {
  beforeEach(() => {
    delete process.env.INPUT_LATEST;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('default', () => {
    expect(getMakeLatest()).toBeFalsy();
  });

  it('empty', () => {
    process.env.INPUT_LATEST = '';
    expect(getMakeLatest()).toBeFalsy();
  });

  it('true', () => {
    process.env.INPUT_LATEST = 'true';
    expect(getMakeLatest()).toBeTruthy();
  });

  it('false', () => {
    process.env.INPUT_LATEST = 'false';
    expect(getMakeLatest()).toBeFalsy();
  });

  it('not bool value', () => {
    process.env.INPUT_LATEST = 'test';
    expect(() => getMakeLatest()).toThrow('latest is not valid bool value!');
  });
});
