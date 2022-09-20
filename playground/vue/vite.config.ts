import path from 'path'
import { fileURLToPath } from 'url'

import vue from '@vitejs/plugin-vue'
import { type AliasOptions, defineConfig } from 'vite'

const baseDir = fileURLToPath(new URL('.', import.meta.url))

const alias: AliasOptions = {
  '~': path.resolve(baseDir, 'src')
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias
  }
})
