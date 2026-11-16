export default {
  '*.{js,mjs,ts}': ['eslint --fix', 'prettier --write'],
  '*.{json,html,css,md,yml,yaml}': 'prettier --write',
};
