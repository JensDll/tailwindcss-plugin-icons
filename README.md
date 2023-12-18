# tailwindcss-plugin-icons

[![npm](https://img.shields.io/npm/v/tailwindcss-plugin-icons)](https://www.npmjs.com/package/tailwindcss-plugin-icons)
[![socket_security](https://socket.dev/api/badge/npm/package/tailwindcss-plugin-icons)](https://socket.dev/npm/package/tailwindcss-plugin-icons)
[![example](https://img.shields.io/badge/example-StackBlitz-green)](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons?file=playground%2Fvue%2Ftailwind.config.ts)
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

## How to Use

1. Search the available icon sets at [Icônes](https://icones.js.org/collection/all?s=) or [Iconify](https://icon-sets.iconify.design/) and choose the icons your project needs.
2. Install any required icon set with `npm install @iconify-json/[the-icon-set-name]`.
3. Configure the plugin in your `tailwind.config` file, for example, [heroicons](https://heroicons.com/):

   ```ts
   import type { Config } from 'tailwindcss'
   import { Icons, type Options } from 'tailwindcss-plugin-icons'

   const options: Options = ({ theme }) => ({
     heroicons: {
       icons: {
         'plus-circle': {
           cursor: 'pointer',
           color: theme('colors.emerald.600'),
           '&:hover': {
             color: theme('colors.emerald.800'),
           },
         },
         'trash?bg': {},
       },
       includeAll: true,
       scale: iconName => (iconName.endsWith('-20-solid') ? 1.25 : 1.5),
       location: 'https://esm.sh/@iconify-json/heroicons@1.1.9/icons.json',
     },
   })

   export default {
     plugins: [Icons(options)],
   } as Config
   ```

   The plugin's `options` are a function. It gets forwarded the [Tailwind CSS plugin API](https://tailwindcss.com/docs/plugins) and returns the selected icons with optional default style and scale. After the icon's name, you can pass `?bg` or `?mask` to force a specific render method. Finally, you can use `includeAll: true` to have every icon in the icon set added as a Tailwind source.

4. Write icons with Tailwind CSS classes directly in your markup:

   ```html
   <div class="i-heroicons-plus-circle"></div>
   <div class="bg-heroicons-trash-black"></div>
   ```

## [Comprehensive Example](https://stackblitz.com/github/JensDll/tailwindcss-plugin-icons?file=playground%2Fvue%2Ftailwind.config.ts)
