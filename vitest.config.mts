import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],
      exclude: ['src/dist'],
    },
    clearMocks: true,
  },
  define: {
    'import.meta.url': JSON.stringify('file://'),
  },
  resolve: {
    alias: [
      {
        find: /^~\/(.+)/,
        replacement: fileURLToPath(new URL('$1', import.meta.url)),
      },
    ],
  },
})
