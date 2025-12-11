import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsYaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Helper that reads the `action.yml` and includes the default values
 * for each input as an environment variable, like the Actions runtime does.
 */
function getDefaultValues(): Record<string, string> {
  const actionManifest = fs.readFileSync(path.resolve(__dirname, '../action.yml'), 'utf8');
  const { inputs } = jsYaml.load(actionManifest) as { inputs: Record<string, { default?: string }> };
  return Object.keys(inputs).reduce<Record<string, string>>(
    (sum, key) => ({
      ...sum,
      [key]: inputs[key]?.default ?? ''
    }),
    {}
  );
}

// Set up environment variables for GitHub Actions context
Object.assign(
  process.env,
  {
    GITHUB_ACTION: 'my-action',
    GITHUB_ACTOR: 'raven-actions',
    GITHUB_EVENT_NAME: 'release',
    GITHUB_EVENT_PATH: path.resolve(__dirname, 'fixtures', 'release.json'),
    GITHUB_REF: 'main',
    GITHUB_REPOSITORY: 'raven-actions/test',
    GITHUB_SHA: '123abc',
    GITHUB_TOKEN: '456def',
    GITHUB_WORKFLOW: 'my-workflow',
    GITHUB_WORKSPACE: path.resolve(__dirname, 'fixtures', 'workspace', 'javascript'),
    HOME: '?'
  },
  getDefaultValues()
);
