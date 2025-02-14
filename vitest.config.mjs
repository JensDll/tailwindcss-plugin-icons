import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],
      exclude: ['src/dist'],
    },
  },
  define: {
    'import.meta.url': 'file://',
  },
})
