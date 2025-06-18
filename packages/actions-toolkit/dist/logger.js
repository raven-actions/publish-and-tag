var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as core from '@actions/core';
import { pino } from 'pino';
// Create logger levels that match common usage patterns
var LOG_LEVELS = {
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
var Logger = /** @class */ (function () {
    function Logger(options) {
        if (options === void 0) { options = {}; }
        var _a, _b;
        this.isDisabled = (_a = options.disabled) !== null && _a !== void 0 ? _a : false;
        // Configure Pino with GitHub Actions-friendly options
        var pinoOptions = __assign({ level: (_b = options.level) !== null && _b !== void 0 ? _b : 'info', formatters: {
                level: function (label) {
                    return { level: label };
                }
            } }, (options.prettyPrint && !process.env.GITHUB_ACTIONS
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
            : {}));
        this.pino = pino(pinoOptions);
    }
    // Core logging methods
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info(this.formatMessage(message, args));
        }
        else {
            this.pino.info(this.formatMessage(message, args));
        }
    };
    Logger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.debug(this.formatMessage(message, args));
        }
        else {
            this.pino.debug(this.formatMessage(message, args));
        }
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.warning(this.formatMessage(message, args));
        }
        else {
            this.pino.warn(this.formatMessage(message, args));
        }
    };
    Logger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.error(this.formatMessage(message, args));
        }
        else {
            this.pino.error(this.formatMessage(message, args));
        }
    };
    Logger.prototype.fatal = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.error(this.formatMessage(message, args));
        }
        else {
            this.pino.fatal(this.formatMessage(message, args));
        }
    };
    // Signale compatibility methods
    Logger.prototype.success = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info("\u2705 ".concat(this.formatMessage(message, args)));
        }
        else {
            this.pino.info("\u2705 ".concat(this.formatMessage(message, args)));
        }
    };
    Logger.prototype.complete = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.isDisabled)
            return;
        if (process.env.GITHUB_ACTIONS) {
            core.info("\u2705 ".concat(this.formatMessage(message, args)));
        }
        else {
            this.pino.info("\u2705 ".concat(this.formatMessage(message, args)));
        }
    };
    // Logger state management
    Logger.prototype.disable = function () {
        this.isDisabled = true;
    };
    Logger.prototype.enable = function () {
        this.isDisabled = false;
    };
    Logger.prototype.isEnabled = function () {
        return !this.isDisabled;
    };
    // Secret management (placeholder for compatibility)
    Logger.prototype.addSecrets = function (secrets) {
        // GitHub Actions automatically masks secrets, so this is a no-op
        secrets.forEach(function (secret) {
            if (process.env.GITHUB_ACTIONS) {
                core.setSecret(String(secret));
            }
        });
    };
    Logger.prototype.clearSecrets = function () {
        // No-op in GitHub Actions context
    };
    Logger.prototype.formatMessage = function (message, args) {
        if (args.length === 0)
            return message;
        return "".concat(message, " ").concat(args.map(function (arg) { return (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)); }).join(' '));
    };
    return Logger;
}());
export { Logger };
/**
 * Create a callable logger that can be used both as a function and an object
 * This maintains compatibility with the previous Signale interface
 */
export function createLogger(options) {
    if (options === void 0) { options = {}; }
    var logger = new Logger(options);
    // Create a callable function that delegates to info()
    var callable = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return logger.info.apply(logger, __spreadArray([message], args, false));
    };
    // Copy all logger methods to the callable function
    Object.setPrototypeOf(callable, logger);
    Object.assign(callable, logger);
    return callable;
}
// Default export for convenience
export default createLogger;
//# sourceMappingURL=logger.js.map