import { fileURLToPath } from 'node:url'

import { type Options, execa } from 'execa'

export type TagFunction<T> = (
  strings: TemplateStringsArray,
  ...substitutions: readonly unknown[]
) => T

export function run(
  file: string,
  args?: readonly string[],
  options: Omit<Options, 'stdio'> = {},
) {
  return execa(file, args, { ...options, stdio: 'inherit' })
}

export const rootDir = fileURLToPath(new URL('..', import.meta.url))

export const html: TagFunction<string> = (strings, ...substitutions) =>
  String.raw({ raw: strings }, ...substitutions)
