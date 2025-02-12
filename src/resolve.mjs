import fs from 'node:fs/promises'
import path from 'node:path'

import { isUri, toKebabCase, uriToFilename } from './common.mjs'
import { fetchPipe } from './fetch.mjs'

/**
 * @typedef {object} IconifyJson
 * @property {string} prefix
 * @property {Record<string, IconifyJsonIcon>} icons
 * @property {Record<string, IconifyJsonAlias>} [aliases]
 * @property {IconifyJsonInfo} [info]
 * @property {number} [left]
 * @property {number} [top]
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {object} IconifyJsonIcon
 * @property {string} body
 * @property {number} [left]
 * @property {number} [top]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [rotate]
 * @property {boolean} [hFlip]
 * @property {boolean} [vFlip]
 */

/**
 * @typedef {object} IconifyJsonAlias
 * @property {string} parent
 * @property {number} [left]
 * @property {number} [top]
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [rotate]
 * @property {boolean} [hFlip]
 * @property {boolean} [vFlip]
 */

/**
 * @typedef {object} IconifyJsonInfo
 * @property {string} [name]
 */

/**
 * @typedef {(entry: [string, import('./plugin.mjs').ConfigIconSet]) => Promise<IconifyJson>} ResolveIconData
 */

/**
 * @typedef {(root: string) => ResolveIconData} ResolveIconDataRoot
 */

/**
 * @type {ResolveIconDataRoot}
 */
export const resolveIconData = root => async entry => {
  const [iconSetName, { location }] = entry
  const kebabCaseIconSetName = (entry[0] = toKebabCase(iconSetName))

  if (!location) {
    try {
      const { default: json } = await import(
        `@iconify-json/${kebabCaseIconSetName}/icons.json`,
        { with: { type: 'json' } }
      )
      return json
    } catch {}

    try {
      const { default: json } = await import(
        `@iconify/json/json/${kebabCaseIconSetName}.json`,
        { with: { type: 'json' } }
      )
      return json
    } catch {}

    throw new Error(
      `Icon set "${iconSetName}" not found. Please see if the name is correct or try installing it with "npm install @iconify-json/${kebabCaseIconSetName}"`,
    )
  }

  if (isUri(location)) {
    const path = new URL(uriToFilename(location), import.meta.url)

    try {
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/42866
      const { default: json } = await import(path, { with: { type: 'json' } })
      return json
    } catch {}

    await fetchPipe(location)

    // @ts-ignore https://github.com/microsoft/TypeScript/issues/42866
    const { default: json } = await import(path, { with: { type: 'json' } })
    return json
  }

  try {
    const { default: json } = await import(location, { with: { type: 'json' } })
    return json
  } catch {}

  let fileHandle

  try {
    fileHandle = await fs.open(path.join(root, location))
    return JSON.parse(await fileHandle.readFile('utf8'))
  } catch {
    throw new Error(`Failed to find icon set at location "${location}"`)
  } finally {
    await fileHandle?.close()
  }
}
