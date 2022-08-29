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
  type LoadedIcon
} from '@internal/shared'
import type { IconifyJSON } from '@iconify/types'

import { IconifyFileCache } from './cache'

const iconVarName = '--tw-plugin-icons-url'

const getIconCssAsMask = (icon: LoadedIcon) => {
  const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${icon.body}</svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  if (icon.mode === 'mask') {
    return {
      [iconVarName]: url,
      mask: `var(${iconVarName}) no-repeat`,
      '-webkit-mask': `var(${iconVarName}) no-repeat`,
      maskSize: '100% 100%',
      '-webkit-mask-size': '100% 100%',
      backgroundColor: 'currentColor'
    }
  }

  if (icon.mode === 'color') {
    return {
      [iconVarName]: url,
      background: `var(${iconVarName}) no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }
}

const getIconCssAsBackground = (icon: LoadedIcon) => (color: string) => {
  const coloredBody = icon.body.replace(/currentColor/g, color)
  const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${coloredBody}</svg>`
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
  iconifyJson: IconifyJSON
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
          resolvedIconSets[kebabCaseIconSetName] = {
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
          `Icon set "${iconSetName}" does not exist at location "${location}"`
        )
      }

      resolvedIconSets[kebabCaseIconSetName] = {
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

      resolvedIconSets[kebabCaseIconSetName] = {
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

      resolvedIconSets[kebabCaseIconSetName] = {
        iconNames: icons,
        iconifyJson: JSON.parse(fs.readFileSync(jsonPath, 'ascii'))
      }

      continue
    } catch {}

    throw new Error(
      `Icon set "${iconSetName}" not found. Try installing it with "npm install @iconify/${kebabCaseIconSetName}".`
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
      const loadedIcon = loadIconFromJson(iconifyJson, iconName)

      if (loadedIcon.mode === 'bg') {
        asBackground[`bg-${iconSetName}-${loadedIcon.name}`] =
          getIconCssAsBackground(loadedIcon)
      } else {
        asMask[`.i-${iconSetName}-${loadedIcon.name}`] =
          getIconCssAsMask(loadedIcon)
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

export type IconSets = {
  [iconSetName: string]: {
    icons: string[]
    location?: string
  }
}
