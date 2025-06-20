import getMakeLatest from '../src/get-make-latest.js'
import { generateToolkit } from './helpers.js'
import { Toolkit } from 'actions-toolkit'
import { jest } from '@jest/globals'

describe('get-make-latest', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_LATEST
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('default', () => {
    expect(getMakeLatest(tools)).toBeFalsy()
  })

  it('empty', () => {
    process.env.INPUT_LATEST = ''
    expect(getMakeLatest(tools)).toBeFalsy()
  })

  it('true', () => {
    process.env.INPUT_LATEST = 'true'
    expect(getMakeLatest(tools)).toBeTruthy()
  })

  it('false', () => {
    process.env.INPUT_LATEST = 'false'
    expect(getMakeLatest(tools)).toBeFalsy()
  })

  it('not bool value', () => {
    process.env.INPUT_LATEST = 'test'
    expect(() => getMakeLatest(tools)).toThrow('latest is not valid bool value!')
  })
})
