/** @type {import("prettier").Options} */
export default {
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'all',
  semi: false,
  plugins: [import('prettier-plugin-tailwindcss')],
}
