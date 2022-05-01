import { execa, type Options } from 'execa'

export function run(
  file: string,
  args?: readonly string[],
  options: Omit<Options, 'stdio'> = {}
) {
  return execa(file, args, { ...options, stdio: 'inherit' })
}
