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
} from './utils'

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
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${width} ${height}">${body}</svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  if (mode === 'mask') {
    return {
      mask: `${url} no-repeat`,
      maskSize: '100% 100%',
      backgroundColor: 'currentColor'
    }
  }

  if (mode === 'color') {
    return {
      background: `${url} no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }
}

const getIconAsBackground = (width: number, height: number, body: string) => {
  return (color: string) => {
    body = body.replace(/currentColor/g, color)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${width} ${height}">${body}</svg>`
    const url = `url("data:image/svg+xml,${encodeSvg(svg)}")`

    return {
      background: `${url} no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }
}

type ResolvedIconsSets = {
  iconNames: string[]
  iconifyJson: IconifyJson
}

const resolveIconSets = (iconsSets: IconSets) => {
  const resolvedIconSets: Record<string, ResolvedIconsSets> = {}

  const toFetch: {
    iconSetName: string
    icons: string[]
    location: string
  }[] = []

  for (const [iconSetName, { icons, location }] of Object.entries(iconsSets)) {
    const kebabCaseIconSetName = toKebabCase(iconSetName)

    if (location !== undefined) {
      if (isUri(location)) {
        // Prepare to fetch the icon set from the given location
        toFetch.push({
          iconSetName,
          icons,
          location
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

    // If there is no location, try and resolve from common iconify modules

    try {
      // When installed individually
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
      // When installed as the entire icon sets
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
    const child = spawnSync(
      'node',
      [
        path.resolve(__dirname, './fetch.mjs'),
        ...toFetch.map(({ location }) => location)
      ],
      {
        maxBuffer: Infinity
      }
    )

    const iconSets: IconifyJson[] = JSON.parse(child.stdout.toString())

    iconSets.forEach((iconifyJson, i) => {
      resolvedIconSets[toFetch[i].iconSetName] = {
        iconNames: toFetch[i].icons,
        iconifyJson
      }
    })
  }

  return resolvedIconSets
}

export const Icons = plugin.withOptions<IconSets>(iconSets => {
  iconSets ??= {}

  const resolvedIconSets = resolveIconSets(iconSets)

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
