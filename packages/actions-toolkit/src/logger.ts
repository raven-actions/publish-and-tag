import * as core from '@actions/core'
import pino, { type Logger as PinoLogger, type LoggerOptions as PinoLoggerOptions } from 'pino'

// Create logger levels that match common usage patterns
const LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
} as const

type LogLevel = keyof typeof LOG_LEVELS

export interface LoggerOptions {
  disabled?: boolean
  level?: LogLevel
  prettyPrint?: boolean
}

/**
 * Modern logger interface compatible with the previous Signale implementation
 * Built on top of Pino for better performance and ESM support
 */
export class Logger {
  private p: PinoLogger
  private isDisabled: boolean

  constructor(options: LoggerOptions = {}) {
    this.isDisabled = options.disabled ?? false

    // Configure Pino with GitHub Actions-friendly options
    const pinoOptions: PinoLoggerOptions = {
      level: options.level ?? 'info',
      formatters: {
        level(label: string) {
          return { level: label }
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
    }

    this.p = pino(pinoOptions)
  }

  // Core logging methods
  info(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.info(this.formatMessage(message, args))
    } else {
      this.p.info(this.formatMessage(message, args))
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.debug(this.formatMessage(message, args))
    } else {
      this.p.debug(this.formatMessage(message, args))
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.warning(this.formatMessage(message, args))
    } else {
      this.p.warn(this.formatMessage(message, args))
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.error(this.formatMessage(message, args))
    } else {
      this.p.error(this.formatMessage(message, args))
    }
  }

  fatal(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.error(this.formatMessage(message, args))
    } else {
      this.p.fatal(this.formatMessage(message, args))
    }
  }

  // Signale compatibility methods
  success(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.info(`✅ ${this.formatMessage(message, args)}`)
    } else {
      this.p.info(`✅ ${this.formatMessage(message, args)}`)
    }
  }

  complete(message: string, ...args: unknown[]): void {
    if (this.isDisabled) return
    if (process.env.GITHUB_ACTIONS) {
      core.info(`✅ ${this.formatMessage(message, args)}`)
    } else {
      this.p.info(`✅ ${this.formatMessage(message, args)}`)
    }
  }

  // Logger state management
  disable(): void {
    this.isDisabled = true
  }

  enable(): void {
    this.isDisabled = false
  }

  isEnabled(): boolean {
    return !this.isDisabled
  }

  // Secret management (placeholder for compatibility)
  addSecrets(secrets: string[] | number[]): void {
    // GitHub Actions automatically masks secrets, so this is a no-op
    secrets.forEach((secret) => {
      if (process.env.GITHUB_ACTIONS) {
        core.setSecret(String(secret))
      }
    })
  }

  clearSecrets(): void {
    // No-op in GitHub Actions context
  }

  private formatMessage(message: string, args: unknown[]): string {
    if (args.length === 0) return message
    return `${message} ${args.map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ')}`
  }
}

// Type for the callable logger function
export type LoggerFunc = (message: string, ...args: unknown[]) => void

/**
 * Create a callable logger that can be used both as a function and an object
 * This maintains compatibility with the previous Signale interface
 */
export function createLogger(options: LoggerOptions = {}): Logger & LoggerFunc {
  const logger = new Logger(options)

  // Create a callable function that delegates to info()
  const callable = (message: string, ...args: unknown[]) => logger.info(message, ...args)

  // Copy all logger methods to the callable function
  Object.setPrototypeOf(callable, logger)
  Object.assign(callable, logger)

  return callable as Logger & LoggerFunc
}

// Default export for convenience
export default createLogger
