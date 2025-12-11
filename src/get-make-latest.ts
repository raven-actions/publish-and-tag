import * as core from '@actions/core';

export default function getMakeLatest(): boolean {
  let result = false;
  const latestInput = core.getInput('latest');

  if (latestInput) {
    if (latestInput !== 'true' && latestInput !== 'false') {
      throw new Error('latest is not valid bool value!');
    }

    result = latestInput === 'true';
  }

  return result;
}
