import replace from '@rollup/plugin-replace'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],
      exclude: ['src/dist'],
    },
  },
  plugins: [
    replace({
      'import.meta.url': JSON.stringify('file://'),
      preventAssignment: true,
      objectGuards: true,
    }),
  ],
})
