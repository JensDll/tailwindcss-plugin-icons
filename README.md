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

```js
const { Icons } = require('tailwindcss-plugin-icons')

module.exports = {
  [...]
  plugins: [
    Icons({
      heroiconsSolid: {
        // By default it will search for icons in common iconify module locations
        icons: ['trash', 'trash?bg']
      },
      heroiconsOutline: {
        icons: ['lock-open', 'lock-closed'],
        // You can pass other modules too
        location: 'my-icon-alias/icons.json'
      },
      custom: {
        icons: ['loading'],
        // It can be a URI
        location:
          'https://gist.githubusercontent.com/JensDll/4e59cf6005f585581975941a94bc1d88/raw/6cdeb3cb9dacd47fd132d49004a2e8f4cbc0774f/icons.json'
      },
      customAlt: {
        icons: ['loading'],
        // It can be a relative or absolute path
        location: './src/icons.json'
      }
    })
  ]
}
```

After the icon's name, you can pass `?mask` or `?bg` to force a specific render method. Only use `?mask` on coloured and `?bg` on colourless icons. Otherwise, there is no difference from the default.

4. Write icons with [Tailwind CSS](https://tailwindcss.com/docs/installation) classes directly in your markup:

```html
<div class="i-heroicons-solid-trash h-5 w-5"></div>
```

## [Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons/tree/main/playground/vue?file=tailwind.config.js)
