import type { ResolverFunction } from '@rollup/plugin-alias'

export function resolveExtensions(extensions: string[]): ResolverFunction {
  return async function customResolver(source) {
    for (const extension of extensions) {
      try {
        const moduleInfo = await this.load({ id: source + extension })
        return moduleInfo.id
      } catch {}
    }

    return null
  }
}
