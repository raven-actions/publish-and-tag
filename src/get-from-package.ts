import * as glob from '@actions/glob';
import * as core from '@actions/core';
import { getWorkspace, getPackageJSON } from './toolkit.js';
import { isFile } from './file-helper.js';
import { isJavaScriptAction } from './utils.js';
import path from 'path';

export function getMainFromPackage(): string | undefined {
  return getPackageJSON<{ main?: string }>()?.main;
}

export async function getFilesFromPackage(): Promise<{ files: string[] }> {
  const workspace = getWorkspace();
  const { main, files } = getPackageJSON<{
    main?: string;
    files?: string[];
  }>();

  if (!main && !files?.length) {
    throw new Error('Property "main" or "files" do not exist in your `package.json`.');
  }

  const result: string[] = [];

  // Add main file if it's a JavaScript action (not composite or docker)
  if (isJavaScriptAction(main)) {
    result.push(main!);
  }

  if (files?.length) {
    const filesAbsolute = files.map((element) => path.resolve(workspace, element));
    const globber = await glob.create(filesAbsolute.join('\n'));
    const allFiles = await globber.glob();
    const filesRelative = allFiles.map((element) => core.toPosixPath(path.relative(workspace, element)));

    // Filter out main, action manifest files, and non-files, then deduplicate
    const filteredFiles = filesRelative.filter(
      (file) => file !== main && file !== 'action.yml' && file !== 'action.yaml' && isFile(workspace, file)
    );

    return { files: [...new Set([...filteredFiles, ...result])] };
  }

  return { files: result };
}
