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
  // TODO: remove custom transform once the react-native preset is fixed for RN v0.76, maybe?
  transform: {
    '^.+\\.(js)$': ['babel-jest', { plugins: ['babel-plugin-syntax-hermes-parser'] }],
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

export default config;
