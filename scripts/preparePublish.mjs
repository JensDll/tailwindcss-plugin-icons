import fs from 'node:fs/promises'

const distDirPath = new URL('../src/dist/', import.meta.url)
const publishDirPath = new URL('../publish/', import.meta.url)
const publishDistDirPath = new URL('dist/', publishDirPath)

await fs.cp(distDirPath, publishDistDirPath, {
  recursive: true,
  filter(source) {
    return (
      distDirPath.pathname === source ||
      source.endsWith('.mjs') ||
      source.endsWith('.mts') ||
      source.endsWith('.mts.map')
    )
  },
})

await Promise.all([
  fs.copyFile(
    new URL('../src/plugin.css', import.meta.url),
    new URL('plugin.css', publishDistDirPath),
  ),
  fs.copyFile(
    new URL('../src/config.scheme.json', import.meta.url),
    new URL('config.scheme.json', publishDistDirPath),
  ),
  fs.copyFile(
    new URL('../src/package.json', import.meta.url),
    new URL('package.json', publishDirPath),
  ),
  fs.copyFile(
    new URL('../src/package.json', import.meta.url),
    new URL('package.json', publishDirPath),
  ),
  fs.copyFile(
    new URL('../LICENSE', import.meta.url),
    new URL('LICENSE', publishDirPath),
  ),
])
