import fs from 'node:fs/promises'
import path from 'node:path'

import alias, { type Alias, type ResolverFunction } from '@rollup/plugin-alias'

import { rootDir } from './utils'

function resolveExtensions(extensions: string[]): ResolverFunction {
  return async function (source) {
    try {
      const stats = await fs.lstat(source)

      if (stats.isDirectory()) {
        source = path.join(source, 'index')
      }
    } catch {}

    try {
      for (const extension of extensions) {
        const moduleInfo = await this.load({ id: source + extension })
        return moduleInfo.id
      }
    } catch {}

    return null
  }
}

export type AliasWithoutResolver = Omit<Alias, 'customResolver'>

export const tsPathAlias: AliasWithoutResolver = {
  find: /^~(.+?)\/(.+)/,
  replacement: path.resolve(rootDir, 'packages/$1/src/$2')
}

export const tsPathAliasPlugin = alias({
  customResolver: resolveExtensions(['.ts']),
  entries: [tsPathAlias]
})
