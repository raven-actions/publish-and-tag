import jsYaml from 'js-yaml'
import { Toolkit } from 'actions-toolkit'
import { readFile as defaultReadFile, writeFile as defaultWriteFile, checkActionManifestFile } from './file-helper.js'
import { getMainFromPackage } from './get-from-package.js'

export default async function cleanupActionManifest(
  tools: Toolkit,
  // Optional dependency injection for testing
  readFile: typeof defaultReadFile = defaultReadFile,
  writeFile: typeof defaultWriteFile = defaultWriteFile
): Promise<void> {
  const actionManifestFile = checkActionManifestFile(tools.workspace)
  const actionManifestContent = readFile(tools.workspace, actionManifestFile)
  const mainFromPackage = await getMainFromPackage(tools)

  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const config = jsYaml.load(actionManifestContent) as unknown as Record<string, unknown>
    if (typeof config !== 'object') {
      throw new Error(`Action Manifest file [${actionManifestFile}] does not contain valid YAML object`)
    }

    if (mainFromPackage !== 'composite' && mainFromPackage !== 'docker' && mainFromPackage !== '') {
      config.runs = {
        using: 'node20',
        main: mainFromPackage
      }
    }

    tools.log.info('Cleaning up Action Manifest file')
    writeFile(tools.workspace, actionManifestFile, jsYaml.dump(config))
  } catch (error) {
    if (error instanceof jsYaml.YAMLException) {
      throw new Error(`Unable to parse Action Manifest file [${actionManifestFile}]: ${error.reason}`)
    }
    throw error
  }
}
