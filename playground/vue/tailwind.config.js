const path = require('path')

const plugin = require('tailwindcss/plugin')
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
      heroiconsSolid: {
        icons: ['trash', 'trash?bg']
      },
      heroiconsOutline: {
        icons: ['lock-open', 'lock-closed']
      },
      openmoji: {
        icons: ['snake', 'cat', 'dolphin']
      },
      vscodeIcons: {
        // By default will search for common iconify module locations
        icons: ['file-type-light-db?mask']
      },
      brandico: {
        icons: ['facebook'],
        // Can be some other module too
        location: 'my-icon-alias/icons.json'
      },
      custom: {
        icons: ['loading'],
        // Can be a URI
        location:
          'https://gist.githubusercontent.com/JensDll/4e59cf6005f585581975941a94bc1d88/raw/6cdeb3cb9dacd47fd132d49004a2e8f4cbc0774f/icons.json'
      },
      customAlt: {
        icons: ['loading'],
        // Can be a relative or absolute path
        location: path.resolve(__dirname, './src/icons.json')
      }
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        // In Firefox, there is a thin border around the icon when it's animated
        // due to masking the background (version 100.0).
        // This is a possible workaround.
        '.firefox-border-animation-fix': {
          border: '0.01px solid rgba(0, 0, 0, 0)',
          backgroundClip: 'padding-box'
        }
      })
    })
  ]
}
