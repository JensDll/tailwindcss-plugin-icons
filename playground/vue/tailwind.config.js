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
    Icons(({ theme }) => ({
      heroiconsSolid: {
        icons: {
          trash: {}
        },
        // Use scale to apply a default size.
        // Solid heroicons are designed to be rendered at 20x20.
        scale: 1.25 // 1.25em (20px)
      },
      heroiconsOutline: {
        icons: {
          lockOpen: {},
          lockClosed: {},
          plusCircle: {
            // You can use CSS-in-JS syntax for default icon styles.
            // https://tailwindcss.com/docs/plugins#css-in-js-syntax
            color: theme('colors.emerald.600'),
            cursor: 'pointer',
            '&:hover': {
              color: theme('colors.emerald.700')
            }
          },
          minusCircle: {
            color: theme('colors.red.600'),
            cursor: 'pointer',
            '&:hover': {
              color: theme('colors.red.700')
            },
            // A dark mode example.
            '.dark &': {
              color: theme('colors.red.400')
            }
          },
          'trash?bg': {}
        },
        // Outline heroicons are designed to be rendered at 24x24.
        scale: 1.5 // 1.5em (24px)
      },
      lineMd: {
        icons: {
          alignLeft: {},
          alignRight: {},
          arrowAlignLeft: {},
          arrowAlignTop: {},
          arrowAlignRight: {},
          arrowAlignBottom: {}
        },
        scale: 1.5
        // By default, it will search for icons in common iconify module locations.
      },
      logos: {
        icons: {
          emberTomster: {},
          vue: {},
          cardano: {},
          stackblitz: {},
          stackoverflow: {}
        },
        // You can pass other modules too.
        location: 'my-icons/icons.json'
      },
      vscodeIcons: {
        icons: {
          'file-type-light-db?mask': {}
        },
        scale: 1.5,
        // It can be a URI, for example, a CDN.
        location: 'https://esm.sh/@iconify-json/vscode-icons@1.1.11/icons.json'
      },
      custom: {
        icons: {
          loading: {}
        },
        scale: 1.5,
        // Or any other location. Fetched resources will be cached to the file system.
        location:
          'https://gist.githubusercontent.com/JensDll/4e59cf6005f585581975941a94bc1d88/raw/0e70bdac81224add27d8f0576ab15406709e5938/icons.json'
      },
      customLocal: {
        icons: {
          loading: {}
        },
        scale: 1.5,
        // It can be a relative or absolute path.
        location: path.resolve(__dirname, './src/icons.json')
      }
    })),
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
