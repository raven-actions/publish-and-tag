import { Toolkit } from 'actions-toolkit'
import * as glob from '@actions/glob'
import * as core from '@actions/core'
import { isFile } from './file-helper.js'
import path from 'path'

export async function getMainFromPackage(tools: Toolkit): Promise<string | undefined> {
  return tools.getPackageJSON<{ main?: string }>()?.main
}

export async function getFilesFromPackage(tools: Toolkit): Promise<{ files: string[] }> {
  const { main, files } = tools.getPackageJSON<{
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
    // const allFilePaths = files.reduce<string[]>((arr, file) => {
    //   const filePaths = glob.sync(file, {cwd: tools.workspace})
    //   return [...arr, ...filePaths]
    // }, [])

    const filesAbsolute = files.map((element) => path.resolve(tools.workspace, element))
    const globber = await glob.create(filesAbsolute.join('\n'))
    const allFiles = await globber.glob()
    const filesRelative = allFiles.map((element) => core.toPosixPath(path.relative(tools.workspace, element)))

    const newFiles = [
      ...new Set(
        filesRelative.filter((str) => str !== main && str !== 'action.yml' && str !== 'action.yaml').filter((str) => true === isFile(tools.workspace, str))
      ),
      ...result
    ]
    result = [...new Set(newFiles)]
  }

  return { files: result }
}
