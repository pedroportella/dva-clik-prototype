import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  File: 'readonly',
  FormData: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  window: 'readonly',
};

const nodeGlobals = {
  Buffer: 'readonly',
  process: 'readonly',
};

const commonRules = {
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
};

const vueRules = {
  'vue/multi-word-component-names': 'off',

  // Keep templates readable, but avoid noisy formatting-only failures.
  'vue/max-attributes-per-line': [
    'warn',
    {
      singleline: 3,
      multiline: 1,
    },
  ],
  'vue/singleline-html-element-content-newline': 'off',
  'vue/html-self-closing': [
    'warn',
    {
      html: {
        void: 'never',
        normal: 'always',
        component: 'always',
      },
      svg: 'always',
      math: 'always',
    },
  ],
  'vue/attributes-order': 'warn',

  // Useful Vue quality rules.
  'vue/no-mutating-props': 'error',
  'vue/no-v-html': 'warn',
  'vue/require-default-prop': 'off',
  'vue/require-prop-types': 'off',
  'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
};

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'coverage/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...commonRules,
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...commonRules,
      ...vueRules,
    },
  },
];