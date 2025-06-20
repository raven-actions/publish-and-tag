import nock from 'nock'
import path from 'path'
import * as core from '@actions/core'
import { fileURLToPath } from 'url'
import { Toolkit } from '../src/index.js'
import { NeutralCode } from '../src/exit.js'
import { createLogger } from '../src/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Toolkit', () => {
  let toolkit: Toolkit

  beforeEach(() => {
    // Mock core.setFailed to a noop
    jest.spyOn(core, 'setFailed').mockImplementationOnce((f) => f)

    toolkit = new Toolkit({ logger: createLogger({ disabled: true }) })
  })

  describe('.run', () => {
    it('runs the async function passed to it', async () => {
      const spy = jest.fn(() => Promise.resolve('hi'))
      const actual = await Toolkit.run(spy, {
        logger: createLogger({ disabled: true })
      })
      // Test that the function was called
      expect(spy).toHaveBeenCalled()
      // Make sure it was called with a Toolkit instance
      expect((spy.mock.calls as any)[0][0]).toBeInstanceOf(Toolkit)
      // Check that it returned a value as an async function
      expect(actual).toBe('hi')
    })

    it('runs a non-async function passed to it', async () => {
      const spy = jest.fn(() => 'hi')
      const actual = await Toolkit.run(spy, {
        logger: createLogger({ disabled: true })
      })
      // Check that it returned a value as an async function
      expect(actual).toBe('hi')
    })

    it('logs and fails when the function throws an error', async () => {
      const err = new Error('Whoops!')
      const exitFailure = jest.fn<never, any>()

      await Toolkit.run(
        async (twolkit) => {
          twolkit.exit.failure = exitFailure
          throw err
        },
        { logger: createLogger({ disabled: true }) }
      )

      expect(exitFailure).toHaveBeenCalledTimes(1)
    })
  })

  describe('#github', () => {
    it('returns a GitHub client', () => {
      expect(toolkit.github).toBeInstanceOf(Object)
    })

    it('returns a GraphQL function on `.graphql`', async () => {
      expect(toolkit.github.graphql).toBeInstanceOf(Function)

      const scoped = nock('https://api.github.com')
        .post('/graphql')
        .reply(200, { data: { errors: [] } })

      await toolkit.github.graphql('query { }')
      expect(scoped.isDone()).toBe(true)
    })
  })

  describe('#readFile', () => {
    it('gets the contents of a file', async () => {
      const actual = await toolkit.readFile('README.md')
      expect(actual).toMatchSnapshot()
    })

    it('gets the contents of a file with custom encoding', async () => {
      const actual = await toolkit.readFile('README.md', 'base64')
      expect(actual).toMatchSnapshot()
    })

    it('throws if the file could not be found', async () => {
      await expect(toolkit.readFile('DONTREADME.md')).rejects.toThrowErrorMatchingSnapshot()
    })
  })

  describe('#getPackageJSON', () => {
    it('returns the package.json file as a JSON object', () => {
      const actual = toolkit.getPackageJSON()
      expect(actual).toMatchSnapshot()
    })

    it('throws if the package.json file could not be found', () => {
      toolkit.workspace = path.join(__dirname, 'fixtures', 'workspaces', 'no-package-json')
      const actual = () => toolkit.getPackageJSON()
      expect(actual).toThrowErrorMatchingSnapshot()
    })
  })

  describe('#command', () => {
    let spy: jest.Mock<any, any>

    beforeEach(() => {
      spy = jest.fn()
    })

    it('calls the handler without any args', async () => {
      toolkit.context.payload.comment = { body: '/action' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
    })

    it('ignores commands not at the beginning of the line', async () => {
      toolkit.context.payload.comment = { body: 'Hello /action' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('only matches the exact command', async () => {
      toolkit.context.payload.comment = { body: '/actionssssssssss' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls the handler with a command at the beginning of a line that is not the first line', async () => {
      toolkit.context.payload.comment = { body: 'Hello\n/action' }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
    })

    it('calls the handler with parsed args', async () => {
      toolkit.context.payload.comment = {
        body: '/action testing another --file index.js'
      }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalled()
      expect(spy).toHaveBeenCalledWith(
        {
          _: ['testing', 'another'],
          file: 'index.js'
        },
        expect.arrayContaining(['/action testing another --file index.js', 'testing another --file index.js'])
      )
    })

    it('does not call the handler if the body does not contain the command', async () => {
      toolkit.context.payload.comment = { body: 'Hello how are you' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not call the handler if no body is found', async () => {
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })

    it('calls the handler multiple times for multiple matches', async () => {
      toolkit.context.payload.comment = {
        body: '/action\n/action testing\n/action'
      }
      await toolkit.command('action', spy)
      expect(spy).toHaveBeenCalledTimes(3)
    })

    it('does not call the handler if the sender was a bot', async () => {
      toolkit.context.payload.comment = { body: '/action' }
      toolkit.context.payload.sender = { type: 'Bot' }
      await toolkit.command('action', spy)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('#wrapLogger', () => {
    it('wraps the provided logger and allows for a callable class', () => {
      const logger = createLogger({ disabled: true })
      const infoSpy = jest.spyOn(logger, 'info')
      const twolkit = new Toolkit({ logger })

      twolkit.log('Hello!')
      twolkit.log.info('Hi!')

      expect(infoSpy).toHaveBeenCalledTimes(2)
      expect(logger.info).toHaveBeenCalledWith('Hello!')
      expect(logger.info).toHaveBeenCalledWith('Hi!')

      // Ensure that prototype methods were carried over
      expect(twolkit.log.disable).toBeInstanceOf(Function)
      expect(twolkit.log.disable).toEqual(logger.disable)
    })
  })
})

describe('Toolkit#constructor', () => {
  let logger: ReturnType<typeof createLogger>
  let loggerSpy: {
    error: jest.SpyInstance
    warn: jest.SpyInstance
    fatal: jest.SpyInstance
  }
  let exit: (code?: number) => never

  beforeEach(() => {
    logger = createLogger({ disabled: true })
    loggerSpy = {
      error: jest.spyOn(logger, 'error'),
      warn: jest.spyOn(logger, 'warn'),
      fatal: jest.spyOn(logger, 'fatal')
    }

    exit = global.process.exit
    const p = global.process as any
    p.exit = jest.fn()
  })

  describe('missing env vars', () => {
    it('logs the expected string with missing env vars', () => {
      delete process.env.HOME
      new Toolkit({ logger })
      expect(loggerSpy.warn.mock.calls).toMatchSnapshot()
    })
  })

  describe('events', () => {
    it('exits if the event is not allowed with an array of events', () => {
      new Toolkit({ logger, event: ['pull_request'] })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(loggerSpy.error.mock.calls).toMatchSnapshot()
    })

    it('does not exit if the event is one of the allowed with an array of events', () => {
      new Toolkit({ logger, event: ['pull_request', 'issues'] })
      expect(process.exit).not.toHaveBeenCalled()
      expect(logger.error).not.toHaveBeenCalled()
    })

    it('exits if the event is not allowed with a single event', () => {
      new Toolkit({ logger, event: 'pull_request' })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(loggerSpy.error.mock.calls).toMatchSnapshot()
    })

    it('exits if the event is not allowed with an array of events with actions', () => {
      new Toolkit({ logger, event: ['pull_request.opened'] })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(loggerSpy.error.mock.calls).toMatchSnapshot()
    })

    it('exits if the event is not allowed with a single event with an action', () => {
      new Toolkit({ logger, event: 'pull_request.opened' })
      expect(process.exit).toHaveBeenCalledWith(NeutralCode)
      expect(loggerSpy.error.mock.calls).toMatchSnapshot()
    })

    it('does not exit if the event is allowed with a single event with an action', () => {
      new Toolkit({ logger, event: 'issues.opened' })
      expect(process.exit).not.toHaveBeenCalledWith()
    })
  })

  describe('secrets', () => {
    it('does nothing when passed an empty array', () => {
      logger.fatal = jest.fn()
      new Toolkit({ logger, secrets: [] })
      expect(logger.fatal).not.toHaveBeenCalled()
    })

    it('does nothing when no required secrets are missing', () => {
      process.env.I_EXIST = 'boo'
      new Toolkit({ logger, secrets: ['I_EXIST'] })
      expect(loggerSpy.fatal).not.toHaveBeenCalled()
    })

    it('calls the exit.failure with missing secrets', () => {
      // Delete this, juuuust in case
      delete process.env.DO_NOT_EXIST

      new Toolkit({ logger, secrets: ['DO_NOT_EXIST'] })
      expect(loggerSpy.fatal).toHaveBeenCalled()
      expect(loggerSpy.fatal.mock.calls).toMatchSnapshot()
    })
  })

  describe('token', () => {
    it('uses a different GitHub token', async () => {
      const toolkit = new Toolkit({
        logger: createLogger({ disabled: true }),
        token: 'customtoken'
      })

      const scoped = nock('https://api.github.com', {
        reqheaders: {
          authorization: 'token customtoken'
        }
      })
        .get('/issues')
        .reply(200, [])

      await toolkit.github.issues.list()
      expect(scoped.isDone()).toBe(true)
    })
  })

  // tslint:enable:no-unused-expression
  afterEach(() => {
    global.process.exit = exit
  })
})
