import globals from 'globals'
import vue from 'eslint-plugin-vue';
import eslintPlugin from '@eslint/js';

export default [
  eslintPlugin.configs.recommended,
  {
    files: ['*.vue'],
    languageOptions: {
      parser: await vue.parser,
      globals: {
        // https://eslint.vuejs.org/user-guide/#specifying-globals-eslint-config-js
        ...globals.browser
      }
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,
    },
  },
];
