import fs from 'node:fs/promises'
import path from 'node:path'

import alias, { type Alias, type ResolverFunction } from '@rollup/plugin-alias'

import { rootDir } from './utils.mjs'

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

const resolveTs = resolveExtensions(['.ts'])

export const tildeAlias: AliasWithoutResolver = {
  find: /^~\/(.+)/,
  replacement: path.resolve(rootDir, '$1'),
}
export const tildeAliasPlugin = alias({
  customResolver: resolveTs,
  entries: [tildeAlias],
})

export const sharedChunkAlias: AliasWithoutResolver = {
  find: '@chunks/shared',
  replacement: path.resolve(rootDir, 'src/chunks/shared'),
}
export const sharedChunkAliasPlugin = alias({
  customResolver: resolveTs,
  entries: [sharedChunkAlias],
})

export const stateChunkAlias: AliasWithoutResolver = {
  find: '@chunks/state',
  replacement: path.resolve(rootDir, 'src/chunks/state'),
}
export const stateChunkAliasPlugin = alias({
  customResolver: resolveTs,
  entries: [stateChunkAlias],
})
