/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  clearMocks: true,
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/lib/', '/node_modules/'],
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['<rootDir>/tests/**/*.test.(ts|js)'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  verbose: true,
  reporters: ['default', 'summary', ['github-actions', {silent: false}], ['jest-junit', {outputDirectory: 'reports', outputName: 'jest-report.xml'}]],
  coverageDirectory: 'coverage',
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary', 'cobertura'],
  coverageThreshold: {
    global: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: -10
      }
    }
  }
}
