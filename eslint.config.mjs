import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['src/dist', 'playgrounds'],
  },
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  {
    languageOptions: { globals: globals.node, ecmaVersion: 'latest' },
    rules: {
      'no-empty': 'off',
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
          ignore: ['vitest'],
        },
      ],
    },
  },
]
