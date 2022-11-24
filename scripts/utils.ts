import { fileURLToPath } from 'node:url'

import { type Options, execa } from 'execa'

export function run(
  file: string,
  args?: readonly string[],
  options: Omit<Options, 'stdio'> = {}
) {
  return execa(file, args, { ...options, stdio: 'inherit' })
}

export const rootDir = fileURLToPath(new URL('..', import.meta.url))
