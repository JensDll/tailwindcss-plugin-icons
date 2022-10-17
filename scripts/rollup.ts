import path from 'node:path'

import type { ResolverFunction } from '@rollup/plugin-alias'
import fs from 'fs-extra'

export function resolveExtensions(extensions: string[]): ResolverFunction {
  return async function (source) {
    source = path.normalize(source)

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
