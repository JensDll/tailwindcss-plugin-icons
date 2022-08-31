# tailwindcss-plugin-icons

[![npm](https://badgen.net/npm/v/tailwindcss-plugin-icons)](https://www.npmjs.com/package/tailwindcss-plugin-icons)
[![LICENSE](https://badgen.net/github/license/micromatch/micromatch?color=green)](https://github.com/JensDll/tailwindcss-plugin-icons/blob/main/LICENSE)

[Tailwind CSS](https://tailwindcss.com/docs/installation) port of [@unocss/preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons/).

```bash
# Npm
npm install tailwindcss-plugin-icons
# Pnpm
pnpm add tailwindcss-plugin-icons
# Yarn
yarn add tailwindcss-plugin-icons
```

## How to use

1. Search the available icon sets at [Icônes](https://icones.js.org/collection/all?s=) or [Iconify](https://icon-sets.iconify.design/) and choose the icons your project needs
2. Install the icon sets with `npm install @iconify-json/[the-collection-you-want]`. For example [heroicons](https://heroicons.com/) `npm install @iconify-json/heroicons-outline @iconify-json/heroicons-solid`
3. Configure the plugin in your `tailwind.config.js`:

```ts
const { Icons } = require('tailwindcss-plugin-icons')

module.exports = {
  // Other config ...
  plugins: [
    Icons(({ theme }) => ({
      heroiconsOutline: {
        icons: {
          lockOpen: {},
          lockClosed: {},
          plusCircle: {
            // You can use CSS-in-JS syntax for default icon styles.
            // https://tailwindcss.com/docs/plugins#css-in-js-syntax
            cursor: 'pointer',
            color: theme('colors.emerald.600'),
            '&:hover': {
              color: theme('colors.emerald.700')
            }
          },
          minusCircle: {
            cursor: 'pointer',
            color: theme('colors.red.600'),
            '&:hover': {
              color: theme('colors.red.700')
            },
            // Default styles in dark mode.
            '.dark &': {
              color: theme('colors.red.400')
            }
          },
          'trash?bg': {}
        },
        // You use scale to apply a default icon size.
        // Outline heroicons are designed to be rendered at 24x24.
        scale: 1.5 // 1.5em (24px)
        // You can pass a location where it will try and find the icon source.
        // It can be a URI or module name. If no location is given,
        // it will search in common iconify module locations.
        location: 'https:// or my-icons/icons.json'
      }
    }))
  ]
}
```

After the icon's name, you can pass `?mask` or `?bg` to force a specific render method. Only use `?mask` on colored and `?bg` on colorless icons. Otherwise, there is no difference from the default.

4. Write icons with [Tailwind CSS](https://tailwindcss.com/docs/installation) classes directly in your markup:

```html
<div class="i-heroicons-outline-plus-circle"></div>
```

## [Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.js)
