import fs from 'fs-extra'

import { run } from './utils'

const basePath = 'packages/example'

await run('rollup', ['--config'])

console.log()
console.log('Formatting declaration files ...')
await run('pnpm', [
  'exec',
  'prettier',
  '--write',
  'packages/**/dist/index.d.ts'
])

console.log()
console.log('Copying relevant files to publish folder ...')
await Promise.all([
  // Copy LICENSE
  fs.copy('LICENSE', 'publish/LICENSE'),
  // Copy README.md
  fs.copy('README.md', 'publish/README.md'),
  // Copy package.json
  fs.copy(`${basePath}/package.json`, 'publish/package.json'),
  // Copy CommonJS entry point
  fs.copy(`${basePath}/index.cjs`, 'publish/index.cjs'),
  // Copy dist content
  fs.copy(`${basePath}/dist`, 'publish/dist')
])

console.log()
console.log('Done! 🎉')
