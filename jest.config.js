/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/packages/**/__tests__/**/*spec.[jt]s?(x)'],
  modulePathIgnorePatterns: ['<rootDir>/publish'],
  moduleNameMapper: {
    '@internal/(.*)$': '<rootDir>/packages/$1/src'
  },
  globals: {
    __DEV__: true
  }
}
