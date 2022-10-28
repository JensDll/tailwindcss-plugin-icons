import path from 'node:path'

import type { ResolverFunction } from '@rollup/plugin-alias'
import alias from '@rollup/plugin-alias'
import fs from 'fs-extra'

import { rootDir } from './utils'

export function resolveExtensions(extensions: string[]): ResolverFunction {
  return async function (source) {
    const isDirectory = await fs.pathExists(source)

    if (isDirectory) {
      source = path.join(source, 'index')
    }

    for (const extension of extensions) {
      try {
        const moduleInfo = await this.load({ id: source + extension })
        return moduleInfo.id
      } catch (e) {}
    }

    return null
  }
}

export const resolveAliases = alias({
  customResolver: resolveExtensions(['.ts']),
  entries: [
    {
      find: /^~(.+?)\/(.+)/,
      replacement: path.resolve(rootDir, 'packages/$1/src/$2')
    }
  ]
})
