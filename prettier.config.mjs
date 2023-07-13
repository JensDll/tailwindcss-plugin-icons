export default {
  singleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'none',
  semi: false,
  plugins: [await import('prettier-plugin-tailwindcss')]
}
