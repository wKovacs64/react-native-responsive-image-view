module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.{html,css,json,md,mdx,yml,yaml}': ['prettier --write'],
  'README.md': ['doctoc', 'prettier --write'],
};
