import { fileURLToPath } from 'node:url'

import { execa } from 'execa'

/**
 * @param {string} file
 * @param {readonly string[]} args
 * @param {Omit<import('execa').Options, 'stdio'>} options
 * @returns
 */
export function run(file, args, options = {}) {
  return execa(file, args, { ...options, stdio: 'inherit' })
}

export const rootDir = fileURLToPath(new URL('..', import.meta.url))

/**
 * @param {TemplateStringsArray} strings
 * @param  {...unknown} substitutions
 * @returns
 */
export const html = (strings, ...substitutions) =>
  String.raw({ raw: strings }, ...substitutions)
