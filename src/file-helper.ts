import * as fs from 'fs';
import path from 'path';

export function readFile(baseDir: string, file: string): string {
  const pathToFile = path.resolve(baseDir, file);

  if (!fs.existsSync(pathToFile)) {
    throw new Error(`${file} does not exist.`);
  }

  return fs.readFileSync(pathToFile, 'utf8');
}

export function writeFile(baseDir: string, file: string, content: string): void {
  const pathToFile = path.resolve(baseDir, file);
  fs.writeFileSync(pathToFile, content, 'utf8');
}

export function checkActionManifestFile(baseDir: string): string {
  const filenames = ['action.yml', 'action.yaml'];
  for (const filename of filenames) {
    const pathToFile = path.resolve(baseDir, filename);
    if (fs.existsSync(pathToFile)) {
      return filename;
    }
  }

  throw new Error(`Neither 'action.yml' nor 'action.yaml' exist.`);
}

export function isFile(cwd: string, file: string): boolean {
  const filePath = path.resolve(cwd, file);
  const stat = fs.lstatSync(filePath);
  return stat.isFile();
}
