import path from 'node:path'

import fs from 'fs-extra'

import { rootDir, run } from './utils'

const mainPath = path.join(rootDir, 'packages', 'tailwindcss-plugin-icons')

await run('rollup', ['--config', '--configPlugin', 'esbuild'])

console.log()
console.log('Formatting declaration files ...')
await run('pnpm', [
  'prettier',
  'packages/*/dist/index.d.*',
  '--write',
  '--ignore-path',
])

console.log()
console.log('Copying relevant files to publish folder ...')
await Promise.all([
  fs.copy('LICENSE', 'publish/LICENSE'),
  fs.copy('README.md', 'publish/README.md'),
  fs.copy(`${mainPath}/package.json`, 'publish/package.json'),
  fs.copy(`${mainPath}/dist`, 'publish/dist', {
    // Do not copy the cache folder
    filter: path => !path.endsWith('cache'),
  }),
])

console.log()
console.log('Done! 🎉')
