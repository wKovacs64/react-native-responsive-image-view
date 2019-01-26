module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/setupTests.js',
    '<rootDir>/test-fixtures.js',
  ],
  coverageReporters: ['html', 'json', 'lcov', 'text'],
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
