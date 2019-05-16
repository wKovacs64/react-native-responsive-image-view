module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test'],
  coverageReporters: ['html', 'json', 'lcov', 'text'],
  preset: 'native-testing-library',
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.js'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
