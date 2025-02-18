import fs from 'node:fs/promises'

import { normalizePath } from 'vite'

import { CONSOLE_ERROR_NAMESPACE, transformConfig } from './lib.mjs'

/**
 * @typedef {object} Options
 * @prop {string} [config] Path to the icons config searched for in the project root.
 *
 * Default `"icons.json"`
 */

/**
 * @param {Options} [options]
 * @return {import('vite').Plugin}
 */
export function icons(options = {}) {
  const { config: configName = 'icons.json' } = options

  /** @type {string} */
  let root
  /** @type {string} */
  let configPath

  return {
    name: 'tailwindcss-plugin-icons',
    configResolved(config) {
      root = config.root
      configPath = normalizePath(config.root + '/' + configName)
    },
    async buildStart() {
      let config
      try {
        config = JSON.parse(await fs.readFile(configPath, 'utf8'))
      } catch {
        console.error(
          `${CONSOLE_ERROR_NAMESPACE} Failed to find config at "${configPath}"`,
        )
        return
      }
      return transformConfig(config, root)
    },
    async handleHotUpdate({ file, read }) {
      if (file === configPath) {
        const config = JSON.parse(await read())
        return transformConfig(config, root)
      }
    },
  }
}

export { iconUrl } from './lib.mjs'
