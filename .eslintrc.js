module.exports = {
  extends: [
    'plugin:wkovacs64/react',
    'plugin:wkovacs64/jest',
    'plugin:wkovacs64/testing-library',
    'prettier',
  ],
  rules: {
    'testing-library/prefer-screen-queries': 'off',
  },
};
