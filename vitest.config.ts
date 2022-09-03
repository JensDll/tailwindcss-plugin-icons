/// <reference types="vitest" />

import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { defineConfig } from 'vitest/config'

const baseDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    mockReset: true
  },
  resolve: {
    alias: [
      {
        find: /^~(.+)\/(.+)/,
        replacement: path.resolve(baseDir, 'packages/$1/src/$2')
      }
    ]
  }
})
