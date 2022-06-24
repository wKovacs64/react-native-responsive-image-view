module.exports = {
  '*.{js,jsx,ts,tsx}': ['prettier --cache --write', 'eslint --fix'],
  '*.{html,css,json,md,mdx,yml,yaml}': ['prettier --cache --write'],
  'README.md': ['doctoc', 'prettier --cache --write'],
};
