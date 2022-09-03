import { fileURLToPath } from 'url'
import path from 'path'

import { type AliasOptions, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

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
