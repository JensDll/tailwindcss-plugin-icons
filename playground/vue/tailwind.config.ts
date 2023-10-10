import path from 'path'

import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import { Icons, SCALE } from 'tailwindcss-plugin-icons'

export default {
  content: {
    relative: true,
    files: ['./index.html', './src/**/*.vue'],
  },
  darkMode: 'class',
  theme: {},
  plugins: [
    Icons(({ theme }) => ({
      heroiconsSolid: {
        icons: {
          trash: {},
        },
        // You can use scale to apply a default size. For example,
        // solid heroicons are designed to be rendered at 20x20, hence 1.25
        scale: 1.25, // 1.25em (20px)
      },
      heroiconsOutline: {
        icons: {
          'lock-open': {},
          'lock-closed': {},
          'plus-circle': {
            // You can use CSS-in-JS syntax for default icon styles
            // https://tailwindcss.com/docs/plugins#css-in-js-syntax
            color: theme('colors.emerald.600'),
            cursor: 'pointer',
            '&:hover': {
              color: theme('colors.emerald.700'),
            },
          },
          'minus-circle': {
            color: theme('colors.red.600'),
            cursor: 'pointer',
            '&:hover': {
              color: theme('colors.red.700'),
            },
            // A dark mode example
            '.dark &': {
              color: theme('colors.red.400'),
            },
          },
          'trash?bg': {},
        },
        // Outline heroicons are designed to be rendered at 24x24
        scale: 1.5, // 1.5em (24px)
      },
      bi: {
        icons: {
          'people-circle?bg': {},
        },
        scale: 1.25,
        // You can choose to include every icon in the icon set
        includeAll: true,
        // You can adjust the class name prefix for both mask and background icons
        prefix: {
          mask: '',
          background: '',
        },
      },
      lineMd: {
        icons: {
          'check-list-3': {
            color: theme('colors.sky.700'),
          },
        },
        scale: 1.5,
        includeAll: true,
        // By default, it will search for icons in common iconify module locations.
        // Namely "@iconify/json" and "@iconify-json/[the-icon-set-name]"
      },
      logos: {
        icons: {
          'ember-tomster': {
            // You can use the special "SCALE" symbol to apply icon-specific scaling
            [SCALE]: 1.8,
          },
          vue: {
            [SCALE]: 1.2,
          },
          deno: {
            [SCALE]: 1.5,
          },
          stackblitz: {},
          stackoverflow: {},
        },
        // You can specify other modules too
        location: 'my-icons/icons.json',
      },
      vscodeIcons: {
        icons: {
          'file-type-light-db?mask': {},
        },
        scale: 1.5,
        // It can be a URI, for example, from a CDN ...
        location: 'https://esm.sh/@iconify-json/vscode-icons@1.1.20/icons.json',
      },
      custom: {
        icons: {
          loading: {},
        },
        scale: 1.5,
        // ... or any other location. Fetched resources will be cached to the file system
        location:
          'https://gist.githubusercontent.com/JensDll/4e59cf6005f585581975941a94bc1d88/raw/0e70bdac81224add27d8f0576ab15406709e5938/icons.json',
      },
      local: {
        icons: {
          loading: {},
        },
        scale: 1.5,
        // It can be a relative or absolute path
        location: path.resolve(__dirname, './src/icons.json'),
      },
      heroicons: {
        includeAll: true,
        // Scale can be passed a function, which given the icon name, should return a number.
        // It is most useful when the icon set contains icons of multiple sizes,
        // and their names follow a predictable convention
        scale: iconName => (iconName.endsWith('-20-solid') ? 1.25 : 1.5),
      },
    })),
    plugin(({ addUtilities }) => {
      addUtilities({
        // In Firefox, there is a thin border around the loading icon
        // when it's animated due to masking the background (version 100.0).
        // This is a possible workaround. Try it out
        '.firefox-border-animation-fix': {
          border: '0.01px solid rgba(0, 0, 0, 0)',
          backgroundClip: 'padding-box',
        },
      })
    }),
  ],
} as Config
