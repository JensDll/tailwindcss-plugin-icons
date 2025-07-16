import { defineConfig } from 'vitest/config'

import { CONSOLE_ERROR_NAMESPACE } from './src/lib.mjs'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src'],
      exclude: ['src/dist'],
    },
    clearMocks: true,
    onConsoleLog(log, type) {
      return type !== 'stderr' || !log.startsWith(CONSOLE_ERROR_NAMESPACE)
    },
  },
})
