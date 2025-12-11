import * as core from '@actions/core';

export default function getCleanupManifest(): boolean {
  // Default is true (set in action.yml)
  let result = true;
  const cleanupManifestInput = core.getInput('cleanup_manifest');

  if (cleanupManifestInput) {
    if (cleanupManifestInput !== 'true' && cleanupManifestInput !== 'false') {
      throw new Error('cleanup_manifest is not valid bool value!');
    }

    result = cleanupManifestInput === 'true';
  }

  return result;
}
