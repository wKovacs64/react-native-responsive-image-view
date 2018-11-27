module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/setupTests.js',
  ],
  coverageReporters: ['html', 'json', 'lcov', 'text'],
  preset: 'react-native',
  setupTestFrameworkScriptFile: '<rootDir>/setupTests.js',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
