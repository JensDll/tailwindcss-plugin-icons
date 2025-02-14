import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'
import { icons } from 'tailwindcss-plugin-icons'
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss'

export default {
  plugins: [tailwindcss(), icons()],
  css: {
    postcss: {
      plugins: [
        // purgeCSSPlugin({
        //   content: ['index.html'],
        //   variables: true,
        //   safelist: ['md\:text-7xl', '\[\&\>li\]\:m-2', '\[\&\>li\]\:shrink-0'],
        // }),
      ],
    },
  },
} satisfies UserConfig
