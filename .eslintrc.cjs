module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  root: true,
  rules: {
    // https://eslint.org/docs/latest/rules/sort-imports
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true
      }
    ],
    // https://eslint.org/docs/latest/rules/no-empty
    'no-empty': ['error', { allowEmptyCatch: true }],
    // https://typescript-eslint.io/rules/no-extra-semi
    'no-extra-semi': 'off',
    '@typescript-eslint/no-extra-semi': 'off',
    // https://typescript-eslint.io/rules/no-explicit-any
    '@typescript-eslint/no-explicit-any': 'off',
    // https://typescript-eslint.io/rules/no-non-null-assertion
    '@typescript-eslint/no-non-null-assertion': 'off',
    // https://typescript-eslint.io/rules/ban-types
    '@typescript-eslint/ban-types': ['off'],
    // https://typescript-eslint.io/rules/ban-ts-comment
    '@typescript-eslint/ban-ts-comment': 'off',
    // https://typescript-eslint.io/rules/no-empty-interface
    '@typescript-eslint/no-empty-interface': 'off',
    // https://typescript-eslint.io/rules/no-empty-function
    '@typescript-eslint/no-empty-function': 'off',
    // https://typescript-eslint.io/rules/no-var-requires
    '@typescript-eslint/no-var-requires': 'off'
  },
  ignorePatterns: ['**/dist', '**/*.html']
}
