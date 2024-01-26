import { defineConfig } from 'vitest/config'

import { sharedChunkAlias, stateChunkAlias, tildeAlias } from './scripts/rollup'

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
    alias: [tildeAlias, sharedChunkAlias, stateChunkAlias],
  },
})
