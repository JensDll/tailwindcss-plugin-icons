/// <reference types="vitest" />

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    mockReset: true
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
