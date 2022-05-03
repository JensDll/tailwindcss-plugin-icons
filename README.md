# tailwindcss-plugin-icons

[![npm](https://badgen.net/npm/v/tailwindcss-plugin-icons)](https://www.npmjs.com/package/tailwindcss-plugin-icons)
[![LICENSE](https://badgen.net/github/license/micromatch/micromatch?color=green)](https://github.com/JensDll/tailwindcss-plugin-icons/blob/main/LICENSE)

Tailwind CSS port of [@unocss/preset-icons](https://github.com/unocss/unocss/tree/main/packages/preset-icons/).

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

```js
const { Icons } = require('tailwindcss-plugin-icons')

module.exports = {
  [...]
  plugins: [
    Icons({
      // With existing icon sets
      asMask: {
        heroiconsSolid: ['trash', 'dots-vertical'],
        heroiconsOutline: ['trash', 'dots-vertical'],
      },
      asBackground: {
        heroiconsSolid: ['trash']
      },
      // Pass a custom icon set
      custom: {
        asMask: ['loading'],
        location: './src/icons.json'
      }
    })
  ]
}
```

4. Write icons with [Tailwind CSS](https://tailwindcss.com/docs/installation) classes directly in your markup:

```html
<div class="i-heroicons-solid-trash w-5 h-5"></div>
```

## [Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.js)
