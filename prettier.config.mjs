/** @type {import("prettier").Options} */
export default {
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'all',
  semi: false,
  plugins: [await import('prettier-plugin-tailwindcss')],
}
