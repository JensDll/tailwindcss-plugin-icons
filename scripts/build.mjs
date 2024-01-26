import fs from 'fs-extra'

import { run } from './utils.mjs'

await run('rollup', ['--config', '--configPlugin', 'esbuild'])

console.log()
console.log('Formatting declaration files ...')
await run('pnpm', ['prettier', 'dist/index.d.*', '--write', '--ignore-path'])

console.log()
console.log('Copying relevant files to publish folder ...')
await Promise.all([
  fs.copy('LICENSE', 'publish/LICENSE'),
  fs.copy('README.md', 'publish/README.md'),
  fs.copy(`src/package.json`, 'publish/package.json'),
  fs.copy(`dist`, 'publish/dist', {
    filter: path => !path.endsWith('cache'),
  }),
])

console.log()
console.log('Done! 🎉')
