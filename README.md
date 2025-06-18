<!-- cSpell:ignore mheap -->
# 🚀🔖 Publish and Tag Action

[![GitHub - marketplace](https://img.shields.io/badge/marketplace-publish--and--tag-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/publish-and-tag)
[![GitHub - release](https://img.shields.io/github/v/release/raven-actions/publish-and-tag?style=flat-square)](https://github.com/raven-actions/publish-and-tag/releases/latest)
[![GitHub - ci](https://img.shields.io/github/actions/workflow/status/raven-actions/publish-and-tag/ci.yml?logo=github&label=CI&style=flat-square&branch=main&event=push)](https://github.com/raven-actions/publish-and-tag/actions/workflows/ci.yml?query=branch%3Amain+event%3Apush)
[![GitHub - license](https://img.shields.io/github/license/raven-actions/publish-and-tag?style=flat-square)](https://github.com/raven-actions/publish-and-tag/blob/main/LICENSE)
[![Codecov](https://img.shields.io/codecov/c/github/raven-actions/publish-and-tag/main?logo=codecov&style=flat-square&token=VxxCGXH3R5)](https://codecov.io/github/raven-actions/publish-and-tag)

---

> ⚠️ This is a heavily modified fork project of the [build-and-tag-action](https://github.com/JasonEtco/build-and-tag-action), which looks like is stale.

A [GitHub Action](https://github.com/features/actions) for properly publishing and tagging GitHub Actions (`JavaScript` / `TypeScript`, `Docker`, `Composite`)! It's designed to act on new releases and updates the tag only with necessary files. The process looks like this:

- Reads the `main` property in your `package.json`
- Reads the `files` property in your `package.json` to include additional files in your release (optional)
- Force pushes `action.yml` or `action.yaml` and additional files to the release's tag
- Force pushes to the major and minor version tag (ex: `v1.0.0` -> `v1.0` and `v1`) (optional)

![demo](https://raw.githubusercontent.com/raven-actions/publish-and-tag/main/assets/images/demo.png)

## 📑 Table of Contents <!-- omit in toc -->

- [🛠️ Usage](#️-usage)
  - [Prerequisites](#prerequisites)
    - [JavaScript (TypeScript) Action](#javascript-typescript-action)
    - [Docker Action](#docker-action)
    - [Composite Action](#composite-action)
  - [Quick Start](#quick-start)
  - [Additional configuration](#additional-configuration)
- [📥 Inputs](#-inputs)
- [📤 Outputs](#-outputs)
- [🏗️ Project changes - fork vs source](#️-project-changes---fork-vs-source)
- [😎 Motivation](#-motivation)
- [👥 Contributing](#-contributing)
- [🛡️ License](#️-license)

## 🛠️ Usage

### Prerequisites

#### JavaScript (TypeScript) Action

> This repository even uses it! `@vercel/ncc` supports TypeScript out of the box 😍 So, no need to include your `dist/` in the git.

The two important things you'll need to set in your action are the `main` field and the `build` script. Here's an example of a minimal `package.json` that will use `@vercel/ncc` to compile your action to `dist/index.js`, and update your `action.yml` or `action.yaml` file to use the `node20` runtime, and point `publish-and-tag` action at the compiled file.

Example `package.json` for your project:

```json
{
  "name": "your-action-name",
  "main": "dist/index.js",
  "scripts": {
    "build": "npx @vercel/ncc build"
  }
  // rest of your package.json properties
}
```

Your `package.json` will probably contain a `dependencies` section and other fields such as `license`, etc...

#### Docker Action

> ⚠️ Docker Action support is experimental. Use with caution!

By default, Docker Action does not need `package.json`, but for `publish-and-tag` action is required as a kind of manifest file for publishing. The only `main` and `files` (optional) properties should be placed into `package.json`.

```json
{
  "main": "docker",
  "files": [
    // Optional if your docker action uses a container registry pointer without any extra files
    "Dockerfile",
    "entrypoint.sh"
  ]
}
```

#### Composite Action

> ⚠️ Composite Action support is experimental. Use with caution!

By default Composite Action does not need `package.json`, but for `publish-and-tag` action is required as a kind of manifest file for publishing. The only `main` and `files` (optional) properties should be placed into `package.json`.

```json
{
  "main": "composite",
  "files": [
    // Optional if your composite action does not use any files
    "main.js",
    "entrypoint.sh"
  ]
}
```

### Quick Start

```yaml
name: Publish

on:
  release:
    types: [published, edited]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: ${{ github.event.release.tag_name }}

      - name: Install dependencies  # ⚠️ Not required for Composite and Docker Actions! keep only for JavaScript/TypeScript Action
        run: npm ci

      - name: Build  # ⚠️ Not required for Composite and Docker Actions! keep only for JavaScript/TypeScript Action
        run: npm run build

      - name: Publish and Tag Action
        uses: raven-actions/publish-and-tag@v2
```

### Additional configuration

You can also use this action with other events - you'll need to specify a `tag_name` (see [📥 Inputs](#-inputs) section below).

Optionally you can set the `files` property in your `package.json` with the list of the additional files that should be included in your release. Yes, it supports `globs`! Supports via [minimatch](https://github.com/isaacs/minimatch#features).

In the `files`, you do not have to include action manifest files (`action.yml` / `action.yaml`) or file pointed into `main`. Both are included by default. Nothing wrong will happen if any of those files are included in the files, for example, with globs. `publish-and-tag` action will filter it.

```json
{
  "name": "your-action-name",
  "main": "dist/index.js",
  "scripts": {
    "build": "npx @vercel/ncc build"
  },
  "files": [
    "dist/additional.js",
    "extras/*",
    "LICENSE",
    "README.md"
  ]
  // rest of your package.json properties
}
```

## 📥 Inputs

All inputs are `optional`.

|         Name          |   Type   | Default                                                 | Description                                                                                                                                                                                                           |
|:---------------------:|:--------:|:--------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|      `tag_name`       | `string` | *not set*                                               | The tag to update. If the workflow event is `release`, it will use the `tag_name` from the event payload. This option can be helpful when using this action in a workflow with other actions that generate a release. |
|    `rewrite_tags`     |  `bool`  | `true`                                                  | Should rewrite major and minor tags?                                                                                                                                                                                  |
|       `latest`        |  `bool`  | `false`                                                 | If the release is prerelease, should make the release the latest and change it to full release?                                                                                                                       |
|  `cleanup_manifest`   |  `bool`  | `true`                                                  | Should cleanup/rewrite action manifest file (`action.yml` / `action.yaml`)? It means get rid of unnecessary comments and formatting yaml to yaml standards.                                                           |
| `git_commit_message`  | `string` | `Automatic compilation`                                 | Custom git commit message.                                                                                                                                                                                            |
|   `git_author_name`   | `string` | `github-actions[bot]`                                   | Custom git author name.                                                                                                                                                                                               |
|  `git_author_email`   | `string` | `41898282+github-actions[bot]@users.noreply.github.com` | Custom git author email.                                                                                                                                                                                              |
| `git_committer_name`  | `string` | `github-actions[bot]`                                   | Custom git committer name.                                                                                                                                                                                            |
| `git_committer_email` | `string` | `41898282+github-actions[bot]@users.noreply.github.com` | Custom git committer email.                                                                                                                                                                                           |
|    `github_token`     | `string` | `github.token`                                          | The GitHub token used to authenticate with the GitHub API.                                                                                                                                                            |

## 📤 Outputs

|         Name         |   Type   | Description                                |
|:--------------------:|:--------:|:-------------------------------------------|
|     `commit_sha`     | `string` | The SHA of the commit that was tagged.     |
|       `semver`       | `string` | The version of the tag.                    |
|    `semver_major`    | `number` | The major version number of the tag.       |
|    `semver_minor`    | `number` | The minor version number of the tag.       |
|    `semver_patch`    | `number` | The patch version number of the tag.       |
|     `release_id`     | `number` | The ID of the release.                     |
|   `release_draft`    |  `bool`  | Whether the release is a draft.            |
| `release_prerelease` |  `bool`  | Whether the release is a prerelease.       |
|   `release_latest`   |  `bool`  | Whether the release is the latest release. |
|    `release_url`     | `string` | The URL of the release.                    |

## 🏗️ Project changes - fork vs source

- Support for additional files to include: `files` property in `package.js`
- The `glob` support for additional files
- Custom git commit message support
- Custom git author/committer support
- Option to control update or not major and minor tags
- Option to cleanup action manifest file
- Option to mark the release as `latest` (and change from prerelease to full release)
- GitHub token is automatically injected into the action; no need to specify `env` explicitly
- Outputs with version, git commit sha, and basic release details
- Auto-discovery action manifest file: `action.yml` or `action.yaml`
- Docker and Composite Actions support `⚠️ Experimental. Use with caution!`
- Chmod 755 for executable files used in Docker or Composite Actions (only works on `.sh` and `.bash` extensions) `⚠️ Experimental. Use with caution!`
- Renamed to `Publish and Tag`, because the action does not perform build, but rather packaging/publishing

## 😎 Motivation

I am fully aligned with Jason's motivation, but I missed a few functionalities in his action - I couldn't find an alternative in the GitHub marketplace as well. I wanted to have one consistent mechanism for action publishing.

Missing features have been introduced in this forked project. See [🏗️ Project changes - fork vs source](#️-project-changes---fork-vs-source) section for more details.

> Jason's motivation
>
> The [guide to JavaScript Actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action) recommends including `node_modules` in your repository, and manual steps to [following the versioning recommendations](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md#versioning). There are anti-patterns there that just don't sit right with me; so we can enable the same workflow, automatically!
>
> This Action is heavily inspired by [mheap/github-action-auto-compile-node](https://github.com/mheap/github-action-auto-compile-node) & [Actions-R-Us/actions-tagger](https://github.com/Actions-R-Us/actions-tagger). This is more or less a combination of those two Actions, meant to work together.

## 👥 Contributing

Contributions to the project are welcome! Please follow [Contributing Guide](https://github.com/raven-actions/publish-and-tag/blob/main/.github/CONTRIBUTING.md).

## 🛡️ License

This project is distributed under the terms of the [MIT](https://github.com/raven-actions/publish-and-tag/blob/main/LICENSE) license.
