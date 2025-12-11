import * as core from '@actions/core';
import jsYaml from 'js-yaml';
import { getWorkspace } from './toolkit.js';
import { readFile as defaultReadFile, writeFile as defaultWriteFile, checkActionManifestFile } from './file-helper.js';
import { getMainFromPackage } from './get-from-package.js';
import { isJavaScriptAction } from './utils.js';

export default function cleanupActionManifest(
  // Optional dependency injection for testing
  readFile: typeof defaultReadFile = defaultReadFile,
  writeFile: typeof defaultWriteFile = defaultWriteFile
): void {
  const workspace = getWorkspace();
  const actionManifestFile = checkActionManifestFile(workspace);
  const actionManifestContent = readFile(workspace, actionManifestFile);
  const mainFromPackage = getMainFromPackage();

  try {
    const config = jsYaml.load(actionManifestContent);
    if (config === null || typeof config !== 'object') {
      throw new Error(`Action Manifest file [${actionManifestFile}] does not contain valid YAML object`);
    }

    const configRecord = config as Record<string, unknown>;

    // Only update runs for JavaScript actions (not composite or docker)
    if (isJavaScriptAction(mainFromPackage)) {
      configRecord['runs'] = {
        using: 'node24',
        main: mainFromPackage
      };
    }

    core.info('Cleaning up Action Manifest file');
    writeFile(workspace, actionManifestFile, jsYaml.dump(configRecord));
  } catch (error) {
    if (error instanceof jsYaml.YAMLException) {
      throw new Error(`Unable to parse Action Manifest file [${actionManifestFile}]: ${error.reason}`);
    }
    throw error;
  }
}
