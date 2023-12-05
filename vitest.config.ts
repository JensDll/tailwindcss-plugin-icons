import { defineConfig } from 'vitest/config'

import { packagesAlias, scriptsAlias } from './scripts/rollup'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    coverage: {
      extension: 'ts',
      include: ['packages/'],
    },
  },
  resolve: {
    alias: [packagesAlias, scriptsAlias],
  },
})
