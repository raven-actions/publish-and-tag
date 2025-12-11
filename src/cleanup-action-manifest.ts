import * as core from '@actions/core'
import jsYaml from 'js-yaml'
import { getWorkspace } from './toolkit.js'
import { readFile as defaultReadFile, writeFile as defaultWriteFile, checkActionManifestFile } from './file-helper.js'
import { getMainFromPackage } from './get-from-package.js'

export default async function cleanupActionManifest(
  // Optional dependency injection for testing
  readFile: typeof defaultReadFile = defaultReadFile,
  writeFile: typeof defaultWriteFile = defaultWriteFile
): Promise<void> {
  const workspace = getWorkspace()
  const actionManifestFile = checkActionManifestFile(workspace)
  const actionManifestContent = readFile(workspace, actionManifestFile)
  const mainFromPackage = await getMainFromPackage()

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const config = jsYaml.load(actionManifestContent) as unknown as Record<string, unknown>
    if (typeof config !== 'object') {
      throw new Error(`Action Manifest file [${actionManifestFile}] does not contain valid YAML object`)
    }

    if (mainFromPackage !== 'composite' && mainFromPackage !== 'docker' && mainFromPackage !== '') {
      config.runs = {
        using: 'node24',
        main: mainFromPackage
      }
    }

    core.info('Cleaning up Action Manifest file')
    writeFile(workspace, actionManifestFile, jsYaml.dump(config))
  } catch (error) {
    if (error instanceof jsYaml.YAMLException) {
      throw new Error(`Unable to parse Action Manifest file [${actionManifestFile}]: ${error.reason}`)
    }
    throw error
  }
}
