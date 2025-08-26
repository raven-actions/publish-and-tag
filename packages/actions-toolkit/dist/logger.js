import * as core from '@actions/core';
import pino from 'pino';
// Create logger levels that match common usage patterns
const LOG_LEVELS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
};
/**
 * Modern logger interface compatible with the previous Signale implementation
 * Built on top of Pino for better performance and ESM support
 */
export class Logger {
    p;
    isDisabled;
    constructor(options = {}) {
        this.isDisabled = options.disabled ?? false;
        // Configure Pino with GitHub Actions-friendly options
        const pinoOptions = {
            level: options.level ?? 'info',
            formatters: {
                level(label) {
                    return { level: label };
                }
            },
            ...(options.prettyPrint && !process.env.GITHUB_ACTIONS
                ? {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            ignore: 'pid,hostname,time',
                            translateTime: 'HH:MM:ss'
                        }
                    }
                }
                : {})
        };
        this.p = pino(pinoOptions);
    }
    // Core logging methods
    info(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info(this.formatMessage(message, args));
        }
        else {
            this.p.info(this.formatMessage(message, args));
        }
    }
    debug(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.debug(this.formatMessage(message, args));
        }
        else {
            this.p.debug(this.formatMessage(message, args));
        }
    }
    warn(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.warning(this.formatMessage(message, args));
        }
        else {
            this.p.warn(this.formatMessage(message, args));
        }
    }
    error(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.error(this.formatMessage(message, args));
        }
        else {
            this.p.error(this.formatMessage(message, args));
        }
    }
    fatal(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.error(this.formatMessage(message, args));
        }
        else {
            this.p.fatal(this.formatMessage(message, args));
        }
    }
    // Signale compatibility methods
    success(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info(`✅ ${this.formatMessage(message, args)}`);
        }
        else {
            this.p.info(`✅ ${this.formatMessage(message, args)}`);
        }
    }
    complete(message, ...args) {
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info(`✅ ${this.formatMessage(message, args)}`);
        }
        else {
            this.p.info(`✅ ${this.formatMessage(message, args)}`);
        }
    }
    // Logger state management
    disable() {
        this.isDisabled = true;
    }
    enable() {
        this.isDisabled = false;
    }
    isEnabled() {
        return !this.isDisabled;
    }
    // Secret management (placeholder for compatibility)
    addSecrets(secrets) {
        // GitHub Actions automatically masks secrets, so this is a no-op
        secrets.forEach((secret) => {
            if (process.env.GITHUB_ACTIONS) {
                core.setSecret(String(secret));
            }
        });
    }
    clearSecrets() {
        // No-op in GitHub Actions context
    }
    formatMessage(message, args) {
        if (args.length === 0)
            return message;
        return `${message} ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`;
    }
}
/**
 * Create a callable logger that can be used both as a function and an object
 * This maintains compatibility with the previous Signale interface
 */
export function createLogger(options = {}) {
    const logger = new Logger(options);
    // Create a callable function that delegates to info()
    const callable = (message, ...args) => logger.info(message, ...args);
    // Copy all logger methods to the callable function
    Object.setPrototypeOf(callable, logger);
    Object.assign(callable, logger);
    return callable;
}
// Default export for convenience
export default createLogger;
//# sourceMappingURL=logger.js.map