import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import _import from 'eslint-plugin-import'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['src/dist', 'playgrounds', 'publish'],
  },
  eslint.configs.recommended,
  vitest.configs.recommended,
  _import.flatConfigs.recommended,
  {
    languageOptions: { globals: globals.node, ecmaVersion: 'latest' },
    rules: {
      // https://eslint.org/docs/latest/rules
      'no-empty': 'off',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '_+',
        },
      ],
      // https://github.com/import-js/eslint-plugin-import#rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', ['parent', 'sibling']],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'import/no-unresolved': [
        'error',
        {
          ignore: ['vitest/config'],
        },
      ],
      // https://github.com/vitest-dev/eslint-plugin-vitest#rules
      'vitest/consistent-test-it': [
        'error',
        {
          fn: 'test',
        },
      ],
      'vitest/prefer-expect-resolves': 'error',
      'vitest/prefer-hooks-in-order': 'error',
      'vitest/prefer-spy-on': 'error',
      'vitest/prefer-to-have-length': 'error',
      'vitest/expect-expect': 'off',
    },
  },
]
