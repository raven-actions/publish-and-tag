import * as exec from '@actions/exec';
import { EncodingOption } from 'fs';
import { ParsedArgs } from 'minimist';
import { Octokit } from '@octokit/rest';
import { Context } from './context.js';
import { Exit } from './exit.js';
import { InputType } from './inputs.js';
import { OutputType } from './outputs.js';
import { Logger, LoggerFunc } from './logger.js';
export interface ToolkitOptions {
    /**
     * An optional event or list of events that are supported by this Action. If
     * a different event triggers this Action, it will exit with a neutral status.
     */
    event?: string | string[];
    /**
     * An optional list of secrets that are required for this Action to function. If
     * any secrets are missing, this Action will exit with a failing status.
     */
    secrets?: string[];
    logger?: Logger;
    /**
     * GitHub token to use for authentication.
     * Uses `process.env.GITHUB_TOKEN` by default.
     */
    token?: string;
}
export declare class Toolkit<I extends InputType = InputType, O extends OutputType = OutputType> {
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
    static run<I extends InputType = InputType, O extends OutputType = OutputType>(func: (tools: Toolkit<I, O>) => unknown, opts?: ToolkitOptions): Promise<any>;
    context: Context;
    /**
     * Path to a clone of the repository
     */
    workspace: string;
    /**
     * GitHub API token
     */
    token: string;
    /**
     * The @actions/exec library as a function on Toolkit
     */
    exec: (typeof exec)['exec'];
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
    github: Octokit;
    opts: ToolkitOptions;
    /**
     * A collection of methods used to stop an action while it's being run
     */
    exit: Exit;
    /**
     * A general-purpose logger. Modern replacement for Signale using Pino
     */
    log: Logger & LoggerFunc;
    /**
     * An object of the inputs provided to your action. These can all be `undefined`!
     */
    inputs: I;
    /**
     * An object of the outputs provided by your action.
     */
    outputs: O;
    constructor(opts?: ToolkitOptions);
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
    readFile(filename: string, encoding?: EncodingOption): Promise<string | Buffer<ArrayBufferLike>>;
    /**
     * Get the package.json file in the project root
     *
     * ```js
     * const pkg = toolkit.getPackageJSON()
     * ```
     */
    getPackageJSON<T = object>(): T;
    /**
     * Run the handler when someone triggers the `/command` in a comment body.
     *
     * @param command - Command to listen for
     * @param handler - Handler to run when the command is used
     */
    command(command: string, handler: (args: ParsedArgs | {}, match: RegExpExecArray) => Promise<void>): Promise<void>;
    /**
     * Returns true if this event is allowed
     */
    private eventIsAllowed;
    private checkAllowedEvents;
    /**
     * Wrap a Logger so that its a callable class
     */
    private wrapLogger;
    /**
     * Log warnings to the console for missing environment variables
     */
    private warnForMissingEnvVars;
    /**
     * The Action should fail if there are secrets it needs but does not have
     */
    private checkRequiredSecrets;
}
export { Logger, createLogger } from './logger.js';
export type { LoggerFunc } from './logger.js';
export { Context } from './context.js';
export { Exit } from './exit.js';
export { getBody } from './get-body.js';
export { createInputProxy } from './inputs.js';
export type { InputType } from './inputs.js';
export { createOutputProxy } from './outputs.js';
export type { OutputType } from './outputs.js';
