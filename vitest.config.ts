import { defineConfig } from 'vitest/config'

import { tsPathAlias } from './scripts/rollup'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true
  },
  resolve: {
    alias: [tsPathAlias]
  }
})
