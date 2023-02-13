# tailwindcss-plugin-icons

[![npm](https://img.shields.io/npm/v/tailwindcss-plugin-icons)](https://www.npmjs.com/package/tailwindcss-plugin-icons)
[![socket security](https://socket.dev/api/badge/npm/package/tailwindcss-plugin-icons)](https://socket.dev/npm/package/tailwindcss-plugin-icons)
[![example](https://img.shields.io/badge/exmaple-StackBlitz-green)](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.cjs)
[![license](https://img.shields.io/npm/l/tailwindcss-plugin-icons?color=lightgrey)](https://github.com/JensDll/tailwindcss-plugin-icons/blob/main/LICENSE)

[Tailwind CSS](https://tailwindcss.com/docs/installation) implementation of [@unocss/preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons/).

```bash
npm install tailwindcss-plugin-icons
```

```bash
pnpm add tailwindcss-plugin-icons
```

```bash
yarn add tailwindcss-plugin-icons
```

## How to use

1. Search the available icon sets at [Icônes](https://icones.js.org/collection/all?s=) or [Iconify](https://icon-sets.iconify.design/) and choose the icons your project needs.
2. Install any required icon set with `npm install @iconify-json/[the-icon-set-name]`.
3. Configure the plugin in your `tailwind.config` file, for example, [heroicons](https://heroicons.com/):

```js
const { Icons } = require('tailwindcss-plugin-icons')

/**
 * @type {import('tailwindcss-plugin-icons').Options}
 */
const options = ({ theme }) => ({
  heroicons: {
    icons: {
      'plus-circle': {
        cursor: 'pointer',
        color: theme('colors.emerald.600'),
        '&:hover': {
          color: theme('colors.emerald.800')
        }
      },
      'trash?bg': {}
    },
    scale: 1.5,
    includeAll: true,
    location: 'https://esm.sh/@iconify-json/heroicons@1.1.6/icons.json'
  }
})

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  plugins: [Icons(options)]
}
```

The plugin's `options` are a function. It gets forwarded the [Tailwind CSS plugin API](https://tailwindcss.com/docs/plugins) and returns the selected icons with optional default style and scale. After the icon's name, you can pass `?bg` or `?mask` to force a specific render method. Finally, you can use `includeAll: true` to have every icon in the icon set added as a Tailwind source.

<!-- markdownlint-disable ol-prefix -->

4. Write icons with Tailwind CSS classes directly in your markup:

<!-- markdownlint-enable ol-prefix -->

```html
<div class="i-heroicons-plus-circle"></div>
<div class="bg-heroicons-trash-black"></div>
```

## [Comprehensive Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.cjs)
