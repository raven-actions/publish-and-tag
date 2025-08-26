declare const LOG_LEVELS: {
    readonly trace: 10;
    readonly debug: 20;
    readonly info: 30;
    readonly warn: 40;
    readonly error: 50;
    readonly fatal: 60;
};
type LogLevel = keyof typeof LOG_LEVELS;
export interface LoggerOptions {
    disabled?: boolean;
    level?: LogLevel;
    prettyPrint?: boolean;
}
/**
 * Modern logger interface compatible with the previous Signale implementation
 * Built on top of Pino for better performance and ESM support
 */
export declare class Logger {
    private p;
    private isDisabled;
    constructor(options?: LoggerOptions);
    info(message: string, ...args: unknown[]): void;
    debug(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    fatal(message: string, ...args: unknown[]): void;
    success(message: string, ...args: unknown[]): void;
    complete(message: string, ...args: unknown[]): void;
    disable(): void;
    enable(): void;
    isEnabled(): boolean;
    addSecrets(secrets: string[] | number[]): void;
    clearSecrets(): void;
    private formatMessage;
}
export type LoggerFunc = (message: string, ...args: unknown[]) => void;
/**
 * Create a callable logger that can be used both as a function and an object
 * This maintains compatibility with the previous Signale interface
 */
export declare function createLogger(options?: LoggerOptions): Logger & LoggerFunc;
export default createLogger;
