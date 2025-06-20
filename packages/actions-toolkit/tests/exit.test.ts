import { Exit, FailureCode, NeutralCode, SuccessCode } from '../src/exit.js'
import { createLogger, Logger } from '../src/logger.js'

// Need to type these to properly iterate
enum methods {
  Success = 'success',
  Neutral = 'neutral',
  Failure = 'failure'
}

describe('Exit', () => {
  const tests = [
    ['success', 'success', SuccessCode],
    ['neutral', 'info', NeutralCode],
    ['failure', 'fatal', FailureCode]
  ]

  describe.each(tests)('%s', (method, log, code) => {
    let logger: Logger
    let loggerSpies: Record<string, jest.SpyInstance>
    let exit: Exit

    beforeEach(() => {
      // Create a logger to mock
      logger = createLogger({ disabled: true })
      loggerSpies = {
        success: jest.spyOn(logger, 'success'),
        info: jest.spyOn(logger, 'info'),
        fatal: jest.spyOn(logger, 'fatal')
      }

      const p = global.process as any
      p.exit = jest.fn()
      exit = new Exit(logger)
    })

    it('exits with the expected code', () => {
      exit[method as methods]()
      expect(process.exit).toHaveBeenCalledWith(code)
    })

    it('logs the expected message', () => {
      exit[method as methods]('hello')
      expect(loggerSpies[log as string]).toHaveBeenCalledWith('hello')
    })
  })
})
