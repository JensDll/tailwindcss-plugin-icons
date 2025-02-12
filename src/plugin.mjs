import { writeCss } from './css.mjs'
import { resolveIconData } from './resolve.mjs'

/**
 * @typedef {object} Config
 * @property {ConfigIconSets} iconSets
 * @property {ConfigPrefix} prefix
 */

/**
 * @typedef {object} ConfigIconSet
 * @property {string[]} [icons]
 * @property {string} [location]
 */

/**
 * @typedef {Record<string, ConfigIconSet>} ConfigIconSets
 */

/**
 * @typedef {object} ConfigPrefix
 * @property {string} [mask]
 * @property {string} [background]
 */

/**
 * @typedef {object} Options
 * @property {string} [config]
 */

/**
 * @param {Options} options
 * @returns {import('vite').Plugin}
 */
export function icons({ config = 'icons.json' } = {}) {
  /**
   * @type {import('./resolve.mjs').ResolveIconData}
   */
  let resolve
  /**
   * @type {string}
   */
  let configPath

  return {
    name: 'tailwindcss-plugin-icons',
    configResolved({ root }) {
      resolve = resolveIconData(root)
      configPath = root + '/' + config
    },
    async handleHotUpdate({ file, read }) {
      if (file !== configPath) {
        return
      }

      try {
        await writeCss(JSON.parse(await read()), resolve)
      } catch (e) {
        console.error('[tailwindcss-plugin-icons]', e)
      }
    },
  }
}
