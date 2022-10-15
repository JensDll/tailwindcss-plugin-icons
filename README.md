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

1. Search the available icon sets at [Icônes](https://icones.js.org/collection/all?s=) or [Iconify](https://icon-sets.iconify.design/) and choose the icons your project needs.
2. Install the icon sets with `npm install @iconify-json/[the-collection-you-want]`.
3. Configure the plugin in your `tailwind.config.js`, for example, [heroicons](https://heroicons.com/):

```js
const { Icons } = require('tailwindcss-plugin-icons')

/**
 * @type {import('tailwindcss-plugin-icons').Options}
 */
const options = ({ theme }) => ({
  heroicons: {
    icons: {
      'trash?bg': {},
      plusCircle: {
        cursor: 'pointer',
        color: theme('colors.emerald.600'),
        '&:hover': {
          color: theme('colors.emerald.800')
        }
      }
    },
    scale: 1.5,
    includeAll: true,
    location: 'https://esm.sh/@iconify-json/heroicons@1.1.5/icons.json'
  }
})

/**
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  plugins: [Icons(options)]
}
```

The plugin's `options` is a function. It gets forwarded the [Tailwind CSS plugin API](https://tailwindcss.com/docs/plugins) and returns the selected icons with optional default style and scale. After the icon's name, you can pass `?bg` or `?mask` to force a specific render method (see also the [comprehensive example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.js)).

<!-- markdownlint-disable-next-line ol-prefix -->
4. Write icons with [Tailwind CSS](https://tailwindcss.com/docs/installation) classes directly in your markup:

```html
<div class="i-heroicons-outline-plus-circle"></div>
```

## [Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.js)
