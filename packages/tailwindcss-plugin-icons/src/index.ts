import fs from 'fs'
import path from 'path'

import plugin from 'tailwindcss/plugin'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

import { encodeSvg, loadIcon, toKebabCase, type IconMode } from './utils'

export interface IconSet {}

export type IconSetSelector = {
  [K in keyof IconSet extends never
    ? string
    : // @ts-expect-error
      keyof IconSet]?: keyof IconSet extends never ? string[] : IconSet[K][]
}

export type Options = {
  asMask?: IconSetSelector
  asBackground?: IconSetSelector
  custom?: {
    asMask?: string[]
    asBackground?: string[]
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
  } else {
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

const getIconSourcePaths = (options: Options) => {
  const { asMask, asBackground } = options

  const iconSourcePaths: Record<string, string> = {}

  for (const iconSetName of Object.keys({ ...asMask, ...asBackground })) {
    const kebabCaseIconSetName = toKebabCase(iconSetName)

    try {
      const path = require.resolve(
        `@iconify-json/${kebabCaseIconSetName}/icons.json`
      )
      iconSourcePaths[iconSetName] = path
      continue
    } catch {}

    try {
      const path = require.resolve(
        `@iconify/json/json/${kebabCaseIconSetName}.json`
      )
      iconSourcePaths[iconSetName] = path
      continue
    } catch {}

    console.warn(
      `Icon set with name "${iconSetName}" not found. Try installing it with "npm install @iconify/${kebabCaseIconSetName}".`
    )
  }

  return iconSourcePaths
}

export const Icons = plugin.withOptions<Options>(options => {
  options ??= {}
  options.asMask ??= {}
  options.asBackground ??= {}
  options.custom ??= {}
  options.custom.location ??= './icons.json'

  const customLocation = path.resolve(options.custom.location)

  if (!fs.existsSync(customLocation)) {
    console.warn(`Icon set JSON does not exist at path "${customLocation}".`)
    return () => {}
  }

  const iconSourcePaths = getIconSourcePaths(options)

  if (options.custom?.asMask) {
    options.asMask.custom = options.custom.asMask
  }

  if (options.custom?.asBackground) {
    options.asBackground.custom = options.custom.asBackground
  }

  const asMask: Record<string, unknown> = {}
  const asBackground: Record<string, unknown> = {}

  for (const [iconSetName, iconNames] of Object.entries(options.asMask)) {
    const iconifyJson = JSON.parse(
      fs.readFileSync(
        iconSetName === 'custom'
          ? customLocation
          : iconSourcePaths[iconSetName],
        'ascii'
      )
    )

    for (const iconName of iconNames ?? []) {
      const { width, height, body, mode, normalizedIconName } = loadIcon(
        iconifyJson,
        iconName
      )

      asMask[`.i-${toKebabCase(iconSetName)}-${normalizedIconName}`] =
        getIconAsMask(width, height, body, mode)
    }
  }

  for (const [iconSetName, iconNames] of Object.entries(options.asBackground)) {
    const iconifyJson = JSON.parse(
      fs.readFileSync(
        iconSetName === 'custom'
          ? customLocation
          : iconSourcePaths[iconSetName],
        'ascii'
      )
    )

    for (const iconName of iconNames ?? []) {
      const { width, height, body, normalizedIconName } = loadIcon(
        iconifyJson,
        iconName
      )

      asBackground[`bg-${toKebabCase(iconSetName)}-${normalizedIconName}`] =
        getIconAsBackground(width, height, body)
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
