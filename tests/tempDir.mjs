import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterEach, beforeEach, vi } from 'vitest'

/** @type {string} */
export let tempDirPath

beforeEach(async () => {
  tempDirPath = await fs.mkdtemp(
    path.join(os.tmpdir(), 'tailwindcss-plugin-icons-'),
  )

  vi.stubGlobal(
    'URL',
    class extends URL {
      /**
       * @param {string | { toString: () => string }} input
       * @param {string | URL} base
       */
      constructor(input, base) {
        const isFile =
          base instanceof URL
            ? base.protocol === 'file:'
            : base?.startsWith('file:')
        super(input, isFile ? pathToFileURL(tempDirPath + path.sep) : base)
      }
    },
  )
})

afterEach(async () => {
  vi.unstubAllGlobals()

  await fs.rm(tempDirPath, {
    recursive: true,
  })
})

export async function tempDirSnapshot() {
  /** @type {[name: string, data: string][]} */
  const result = []
  const dir = await fs.opendir(tempDirPath)
  for await (const dirent of dir) {
    result.push([
      dirent.name,
      await fs.readFile(path.join(dirent.parentPath, dirent.name), {
        encoding: 'utf8',
      }),
    ])
  }
  return result
}
