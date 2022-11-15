/// <reference types="vitest" />

import path from 'node:path'

import { defineConfig } from 'vitest/config'

import { rootDir } from './scripts/utils'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)\/(.+)/,
        replacement: path.resolve(rootDir, 'packages/$1/src/$2')
      }
    ]
  }
})
