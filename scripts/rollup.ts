import path from 'node:path'

import alias, { type Alias } from '@rollup/plugin-alias'

import { rootDir } from './utils.mjs'

export type AliasWithoutResolver = Omit<Alias, 'customResolver'>

export const tildeAlias: AliasWithoutResolver = {
  find: /^~\/(.+)/,
  replacement: path.resolve(rootDir, '$1'),
}
export const tildeAliasPlugin = alias({
  entries: [tildeAlias],
})

export const sharedChunkAlias: AliasWithoutResolver = {
  find: '@chunks/shared',
  replacement: path.resolve(rootDir, 'src/chunks/shared'),
}
export const sharedChunkAliasPlugin = alias({
  entries: [sharedChunkAlias],
})

export const stateChunkAlias: AliasWithoutResolver = {
  find: '@chunks/state',
  replacement: path.resolve(rootDir, 'src/chunks/state'),
}
export const stateChunkAliasPlugin = alias({
  entries: [stateChunkAlias],
})
