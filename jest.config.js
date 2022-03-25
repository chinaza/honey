/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  modulePathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '@src/(.*)': '<rootDir>/src/$1'
  }
};
