import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

import plugin from 'tailwindcss/plugin'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import {
  encodeSvg,
  isUri,
  loadIconFromJson,
  toKebabCase,
  type IconifyJson,
  type IconMode
} from '@internal/shared'

import { IconifyFileCache } from './cache'

export type IconSets = {
  [iconSetName: string]: {
    icons: string[]
    location?: string
  }
}

const getIconAsMask = (
  width: number,
  height: number,
  body: string,
  mode: IconMode
) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  if (mode === 'mask') {
    return {
      '--tw-plugin-icons-url': url,
      mask: 'var(--tw-plugin-icons-url) no-repeat',
      '-webkit-mask': 'var(--tw-plugin-icons-url) no-repeat',
      maskSize: '100% 100%',
      '-webkit-mask-size': '100% 100%',
      backgroundColor: 'currentColor'
    }
  }

  if (mode === 'color') {
    return {
      '--tw-plugin-icons-url': url,
      background: 'var(--tw-plugin-icons-url) no-repeat',
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }
}

const getIconAsBackground =
  (width: number, height: number, body: string) => (color: string) => {
    const coloredBody = body.replace(/currentColor/g, color)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${coloredBody}</svg>`
    const url = `url("data:image/svg+xml,${encodeSvg(svg)}")`

    return {
      '--tw-plugin-icons-url': url,
      background: 'var(--tw-plugin-icons-url) no-repeat',
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }

type ResolvedIconsSets = {
  iconNames: string[]
  iconifyJson: IconifyJson
}

const cache = new IconifyFileCache(path.resolve(__dirname, 'cache'))

const resolveIconSets = (iconsSets: IconSets) => {
  const resolvedIconSets: Record<string, ResolvedIconsSets> = {}

  const toFetch = new Set<string>()
  const toFetchMeta: {
    iconSetName: string
    icons: string[]
  }[] = []

  for (const [iconSetName, { icons, location }] of Object.entries(iconsSets)) {
    const kebabCaseIconSetName = toKebabCase(iconSetName)

    if (location !== undefined) {
      if (isUri(location)) {
        if (cache.has(location)) {
          resolvedIconSets[iconSetName] = {
            iconNames: icons,
            iconifyJson: cache.get(location)!
          }

          continue
        }

        // Prepare to fetch the icon set from the given location
        toFetch.add(location)
        toFetchMeta.push({
          iconSetName,
          icons
        })

        continue
      }

      let resolvedLocation

      try {
        // Try to resolve the location as a module
        resolvedLocation = require.resolve(location)
      } catch {
        // Otherwise resolve from the file system
        resolvedLocation = path.resolve(location)
      }

      if (!fs.existsSync(resolvedLocation)) {
        throw new Error(
          `Icon set with name "${iconSetName}" and location "${location}" does not exist`
        )
      }

      resolvedIconSets[iconSetName] = {
        iconNames: icons,
        iconifyJson: JSON.parse(fs.readFileSync(resolvedLocation, 'ascii'))
      }

      continue
    }

    // If there is no location, try and resolve from common iconify module locations

    try {
      // When the icon set is installed individually
      const jsonPath = require.resolve(
        `@iconify-json/${kebabCaseIconSetName}/icons.json`
      )

      resolvedIconSets[iconSetName] = {
        iconNames: icons,
        iconifyJson: JSON.parse(fs.readFileSync(jsonPath, 'ascii'))
      }

      continue
    } catch {}

    try {
      // When all icon sets are installed together
      const jsonPath = require.resolve(
        `@iconify/json/json/${kebabCaseIconSetName}.json`
      )

      resolvedIconSets[iconSetName] = {
        iconNames: icons,
        iconifyJson: JSON.parse(fs.readFileSync(jsonPath, 'ascii'))
      }

      continue
    } catch {}

    throw new Error(
      `Icon set with name "${iconSetName}" not found. Try installing it with "npm install @iconify/${kebabCaseIconSetName}".`
    )
  }

  if (toFetch.size) {
    spawnSync('node', [
      path.resolve(__dirname, 'fetch.mjs'),
      cache.cacheDir,
      ...toFetch
    ])

    let i = 0
    for (const location of toFetch) {
      resolvedIconSets[toFetchMeta[i].iconSetName] = {
        iconNames: toFetchMeta[i].icons,
        iconifyJson: cache.get(location)!
      }
      ++i
    }
  }

  return resolvedIconSets
}

export const Icons = plugin.withOptions<IconSets>(iconSets => {
  iconSets ??= {}

  let resolvedIconSets

  try {
    resolvedIconSets = resolveIconSets(iconSets)
  } catch (e) {
    console.error(e)
    return () => {}
  }

  const asMask: Record<string, unknown> = {}
  const asBackground: Record<string, unknown> = {}

  for (const [iconSetName, { iconNames, iconifyJson }] of Object.entries(
    resolvedIconSets
  )) {
    for (const iconName of iconNames) {
      const { width, height, body, mode, normalizedIconName } =
        loadIconFromJson(iconifyJson, iconName)

      if (mode === 'bg') {
        asBackground[`bg-${toKebabCase(iconSetName)}-${normalizedIconName}`] =
          getIconAsBackground(width, height, body)
      } else {
        asMask[`.i-${toKebabCase(iconSetName)}-${normalizedIconName}`] =
          getIconAsMask(width, height, body, mode)
      }
    }
  }

  return function ({ addUtilities, matchUtilities, theme }) {
    addUtilities(asMask)
    matchUtilities(asBackground, {
      values: flattenColorPalette(theme('colors')),
      type: ['color', 'any']
    })
  }
})
