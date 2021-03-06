import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

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

const iconVarName = '--tw-plugin-icons-url'

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
      [iconVarName]: url,
      mask: `var(${iconVarName}) no-repeat`,
      '-webkit-mask': `var(${iconVarName}) no-repeat`,
      maskSize: '100% 100%',
      '-webkit-mask-size': '100% 100%',
      backgroundColor: 'currentColor'
    }
  }

  if (mode === 'color') {
    return {
      [iconVarName]: url,
      background: `var(${iconVarName}) no-repeat`,
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
      [iconVarName]: url,
      background: `var(${iconVarName}) no-repeat`,
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

  const toFetch: {
    icons: string[]
    location: string
    iconSetName: string
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

        // Prepare to fetch the icon set
        toFetch.push({
          icons,
          location,
          iconSetName
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

  if (toFetch.length) {
    execFileSync(
      'node',
      [
        path.resolve(__dirname, 'fetch.mjs'),
        cache.cacheDir,
        ...toFetch.map(toFetch => toFetch.location)
      ],
      {
        stdio: 'pipe'
      }
    )

    for (const { iconSetName, icons, location } of toFetch) {
      resolvedIconSets[iconSetName] = {
        iconNames: icons,
        iconifyJson: cache.get(location)!
      }
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
    if (e instanceof Error) {
      console.error(e.message)
    }

    return () => {}
  }

  const asMask: Record<string, any> = {}
  const asBackground: Record<string, any> = {}

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
