import * as glob from '@actions/glob'
import * as core from '@actions/core'
import { getWorkspace, getPackageJSON } from './toolkit.js'
import { isFile } from './file-helper.js'
import path from 'path'

export async function getMainFromPackage(): Promise<string | undefined> {
  return getPackageJSON<{ main?: string }>()?.main
}

export async function getFilesFromPackage(): Promise<{ files: string[] }> {
  const workspace = getWorkspace()
  const { main, files } = getPackageJSON<{
    main?: string
    files?: string[]
  }>()

  if (!main && !files?.length) {
    throw new Error('Property "main" or "files" do not exist in your `package.json`.')
  }

  let result: string[] = []
  if (main) {
    if (main !== 'composite' && main !== 'docker') {
      result.push(main)
    }
  }

  if (files?.length) {
    const filesAbsolute = files.map((element) => path.resolve(workspace, element))
    const globber = await glob.create(filesAbsolute.join('\n'))
    const allFiles = await globber.glob()
    const filesRelative = allFiles.map((element) => core.toPosixPath(path.relative(workspace, element)))

    const newFiles = [
      ...new Set(filesRelative.filter((str) => str !== main && str !== 'action.yml' && str !== 'action.yaml').filter((str) => true === isFile(workspace, str))),
      ...result
    ]
    result = [...new Set(newFiles)]
  }

  return { files: result }
}
