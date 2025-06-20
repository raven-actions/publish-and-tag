import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import jsYaml from 'js-yaml'

// Import Jest types for globals
import '@jest/globals'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Helper that reads the `action.yml` and includes the default values
 * for each input as an environment variable, like the Actions runtime does.
 */
function getDefaultValues(): object {
  const actionManifest = fs.readFileSync(path.resolve(__dirname, '../action.yml'), 'utf8')
  const { inputs } = jsYaml.load(actionManifest) as any
  return Object.keys(inputs).reduce(
    (sum, key) => ({
      ...sum,
      [key]: inputs[key].default
    }),
    {}
  )
}

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
)
