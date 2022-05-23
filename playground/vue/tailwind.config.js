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
        icons: ['trash']
      },
      heroiconsOutline: {
        icons: ['lock-open', 'lock-closed', 'trash?bg']
      },
      openmoji: {
        // By default, it will search for icons in common iconify module locations
        icons: ['snake', 'cat', 'dolphin']
      },
      brandico: {
        icons: ['facebook'],
        // You can pass other modules too
        location: 'my-icon-alias/icons.json'
      },
      vscodeIcons: {
        icons: ['file-type-light-db?mask'],
        // It can be a URI (for example a CDN)
        location:
          'https://cdn.jsdelivr.net/npm/@iconify-json/vscode-icons@1.1.5/icons.json'
      },
      custom: {
        icons: ['loading'],
        // Or any other location. Fetched resources will be cached to the file system
        location:
          'https://gist.githubusercontent.com/JensDll/4e59cf6005f585581975941a94bc1d88/raw/0e70bdac81224add27d8f0576ab15406709e5938/icons.json'
      },
      customAlt: {
        icons: ['loading'],
        // It can be a relative or absolute path
        location: path.resolve(__dirname, './src/icons.json')
      }
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        // In Firefox, there is a thin border around the icon when it's animated
        // due to masking the background (version 100.0).
        // This is a possible workaround. Try it out.
        '.firefox-border-animation-fix': {
          border: '0.01px solid rgba(0, 0, 0, 0)',
          backgroundClip: 'padding-box'
        }
      })
    })
  ]
}
