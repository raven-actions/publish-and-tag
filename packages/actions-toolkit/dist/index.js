import * as core from '@actions/core';
import * as exec from '@actions/exec';
import fs from 'fs';
import minimist from 'minimist';
import path from 'path';
import { Octokit } from '@octokit/rest';
import { Context } from './context.js';
import { Exit } from './exit.js';
import { getBody } from './get-body.js';
import { createInputProxy } from './inputs.js';
import { createOutputProxy } from './outputs.js';
import { createLogger } from './logger.js';
export class Toolkit {
    /**
     * Run an asynchronous function that accepts a toolkit as its argument, and fail if
     * an error occurs.
     *
     * @param func - Async function to run
     * @param [opts] - Options to pass to the toolkit
     *
     * @example This is generally used to run a `main` async function:
     *
     * ```js
     * Toolkit.run(async tools => {
     *   // Action code here.
     * }, { event: 'push' })
     * ```
     */
    static async run(func, opts) {
        const tools = new Toolkit(opts);
        try {
            const ret = func(tools);
            // If the return value of the provided function is an unresolved Promise
            // await that Promise before return the value, otherwise return as normal
            return ret instanceof Promise ? await ret : ret;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            core.setFailed(errorMessage);
            tools.exit.failure(errorMessage);
        }
    }
    context;
    /**
     * Path to a clone of the repository
     */
    workspace;
    /**
     * GitHub API token
     */
    token;
    /**
     * The @actions/exec library as a function on Toolkit
     */
    exec;
    /**
     * An Octokit SDK client authenticated for this repository. See https://octokit.github.io/rest.js for the API.
     *
     * ```js
     * const newIssue = await tools.github.issues.create({
     *   ...tools.context.repo,
     *   title: 'New issue!',
     *   body: 'Hello Universe!'
     * })
     * ```
     */
    github;
    opts;
    /**
     * A collection of methods used to stop an action while it's being run
     */
    exit;
    /**
     * A general-purpose logger. Modern replacement for Signale using Pino
     */
    log;
    /**
     * An object of the inputs provided to your action. These can all be `undefined`!
     */
    inputs;
    /**
     * An object of the outputs provided by your action.
     */
    outputs;
    constructor(opts = {}) {
        this.opts = opts;
        // Create the logging instance
        this.log = this.wrapLogger(opts.logger || createLogger({ disabled: false }));
        // Print a console warning for missing environment variables
        this.warnForMissingEnvVars();
        // Memoize environment variables and arguments
        this.workspace = process.env.GITHUB_WORKSPACE;
        // Memoize our Proxy instance
        this.inputs = createInputProxy();
        this.outputs = createOutputProxy();
        // Memoize the GitHub API token
        this.token = opts.token || this.inputs.github_token || process.env.GITHUB_TOKEN;
        // Directly expose some other libraries
        this.exec = exec.exec.bind(this);
        // Setup nested objects
        this.exit = new Exit(this.log);
        this.context = new Context();
        this.github = new Octokit({ auth: `token ${this.token}` });
        // Check stuff
        this.checkAllowedEvents(this.opts.event);
        this.checkRequiredSecrets(this.opts.secrets);
    }
    /**
     * Gets the contents of a file in your project's workspace
     *
     * ```js
     * const myFile = tools.readFile('README.md')
     * ```
     *
     * @param filename - Name of the file
     * @param encoding - Encoding (usually utf8)
     */
    async readFile(filename, encoding = 'utf8') {
        const pathToFile = path.join(this.workspace, filename);
        if (!fs.existsSync(pathToFile)) {
            throw new Error(`File ${filename} could not be found in your project's workspace. You may need the actions/checkout action to clone the repository first.`);
        }
        return fs.promises.readFile(pathToFile, encoding);
    }
    /**
     * Get the package.json file in the project root
     *
     * ```js
     * const pkg = toolkit.getPackageJSON()
     * ```
     */
    getPackageJSON() {
        const pathToPackage = path.join(this.workspace, 'package.json');
        if (!fs.existsSync(pathToPackage))
            throw new Error("package.json could not be found in your project's root.");
        return JSON.parse(fs.readFileSync(pathToPackage, 'utf8'));
    }
    /**
     * Run the handler when someone triggers the `/command` in a comment body.
     *
     * @param command - Command to listen for
     * @param handler - Handler to run when the command is used
     */
    async command(command, handler) {
        // Don't trigger for bots
        if (this.context.payload.sender && this.context.payload.sender.type === 'Bot') {
            return;
        }
        this.checkAllowedEvents(['pull_request', 'issues', 'issue_comment', 'commit_comment', 'pull_request_review', 'pull_request_review_comment']);
        const reg = new RegExp(`^/${command}(?:$|\\s(.*))`, 'gm');
        const body = getBody(this.context.payload);
        if (!body)
            return;
        let match;
        // eslint-disable-next-line no-cond-assign
        while ((match = reg.exec(body))) {
            if (match[1]) {
                await handler(minimist(match[1].split(' ')), match);
            }
            else {
                await handler({}, match);
            }
        }
    }
    /**
     * Returns true if this event is allowed
     */
    eventIsAllowed(event) {
        const [eventName, action] = event.split('.');
        if (action) {
            return eventName === this.context.event && this.context.payload.action === action;
        }
        return eventName === this.context.event;
    }
    checkAllowedEvents(event) {
        if (!event)
            return;
        const passed = Array.isArray(event) ? event.some((e) => this.eventIsAllowed(e)) : this.eventIsAllowed(event);
        if (!passed) {
            const actionStr = this.context.payload.action ? `.${this.context.payload.action}` : '';
            this.log.error(`Event \`${this.context.event}${actionStr}\` is not supported by this action.`);
            this.exit.neutral();
        }
    }
    /**
     * Wrap a Logger so that its a callable class
     */
    wrapLogger(logger) {
        // Create a callable function
        const fn = logger.info.bind(logger);
        // Add the log methods onto the function
        const wrapped = Object.assign(fn, logger);
        // Clone the prototype
        Object.setPrototypeOf(wrapped, logger);
        return wrapped;
    }
    /**
     * Log warnings to the console for missing environment variables
     */
    warnForMissingEnvVars() {
        const requiredEnvVars = [
            'HOME',
            'GITHUB_WORKFLOW',
            'GITHUB_ACTION',
            'GITHUB_ACTOR',
            'GITHUB_REPOSITORY',
            'GITHUB_EVENT_NAME',
            'GITHUB_EVENT_PATH',
            'GITHUB_WORKSPACE',
            'GITHUB_SHA'
        ];
        const requiredButMissing = requiredEnvVars.filter((key) => !Object.prototype.hasOwnProperty.call(process.env, key));
        if (requiredButMissing.length > 0) {
            // This isn't being run inside of a GitHub Action environment!
            const list = requiredButMissing.map((key) => `- ${key}`).join('\n');
            const warning = `There are environment variables missing from this runtime, but would be present on GitHub.\n${list}`;
            this.log.warn(warning);
        }
    }
    /**
     * The Action should fail if there are secrets it needs but does not have
     */
    checkRequiredSecrets(secrets) {
        if (!secrets || secrets.length === 0)
            return;
        // Filter missing but required secrets
        const requiredButMissing = secrets.filter((key) => !Object.prototype.hasOwnProperty.call(process.env, key));
        // Everything we need is here
        if (requiredButMissing.length === 0)
            return;
        // Exit with a failing status
        const list = requiredButMissing.map((key) => `- ${key}`).join('\n');
        this.exit.failure(`The following secrets are required for this GitHub Action to run:\n${list}`);
    }
}
// Export logger components
export { Logger, createLogger } from './logger.js';
// Export other components
export { Context } from './context.js';
export { Exit } from './exit.js';
export { getBody } from './get-body.js';
export { createInputProxy } from './inputs.js';
export { createOutputProxy } from './outputs.js';
//# sourceMappingURL=index.js.map