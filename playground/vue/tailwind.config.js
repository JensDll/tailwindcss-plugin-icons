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
        heroiconsSolid: ['trash'],
        heroiconsOutline: ['trash', 'lock-open', 'lock-closed'],
        openmoji: ['snake', 'cat', 'dolphin'],
        vscodeIcons: ['file-type-light-db?mask'],
        brandico: ['facebook']
      },
      asBackground: {
        heroiconsSolid: ['trash']
      },
      custom: {
        asMask: ['loading'],
        location: './src/icons.json'
      }
    })
  ]
}
