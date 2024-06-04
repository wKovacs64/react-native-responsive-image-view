import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/__tests__',
    '<rootDir>/src/__fixtures__',
  ],
  coverageReporters: ['html', 'json', 'lcov', 'text'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

export default config;
