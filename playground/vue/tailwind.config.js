const { Icons } = require('tailwindcss-plugin-icons')

/**
 * @type {import('tailwindcss/tailwind-config').TailwindTheme}
 */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {},
  plugins: [
    Icons({
      asMask: {
        'heroicons-solid': ['trash'],
        'heroicons-outline': ['trash', 'lock-open', 'lock-closed']
      },
      asBackground: {
        'heroicons-solid': ['trash']
      }
    })
  ]
}
