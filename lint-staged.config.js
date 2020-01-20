module.exports = {
  '*.js': ['prettier --write', 'eslint --fix'],
  '*.{json,md,yml}': ['prettier --write'],
  'README.md': ['doctoc', 'prettier --write'],
};
