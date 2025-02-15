import fs from 'node:fs/promises'

import { transformConfig } from './lib.mjs'

/**
 * @typedef {object} Options
 * @prop {string} [config] The icons config name in the project root. Default `"icons.json"`.
 */

/**
 * @param {Options} [options]
 * @return {import('vite').Plugin}
 */
export function icons(options = {}) {
  const { config: iconsConfigName = 'icons.json' } = options

  /** @type {string} */
  let root
  /** @type {string} */
  let iconsConfigPath

  return {
    name: 'tailwindcss-plugin-icons',
    configResolved(config) {
      root = config.root
      iconsConfigPath = config.root + '/' + iconsConfigName
    },
    async buildStart() {
      const config = JSON.parse(await fs.readFile(iconsConfigPath, 'utf8'))
      return transformConfig(config, root)
    },
    async handleHotUpdate({ file, read }) {
      if (file === iconsConfigPath) {
        const config = JSON.parse(await read())
        return transformConfig(config, root)
      }
    },
  }
}

export { iconUrl } from './lib.mjs'
