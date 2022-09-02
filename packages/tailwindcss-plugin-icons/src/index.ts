import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'

import plugin from 'tailwindcss/plugin'
import type { CSSRuleObject, PluginAPI } from 'tailwindcss/types/config'
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

function getIconDimensions(icon: LoadedIcon, scale: number) {
  return {
    width: `${(icon.width / icon.height) * scale}em`,
    height: `${scale}em`
  }
}

function getIconCss(
  icon: LoadedIcon,
  scale: number,
  cssDefaults: CSSRuleObject
) {
  const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${icon.body}</svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  const iconDimensions = getIconDimensions(icon, scale)

  if (icon.mode === 'mask') {
    return {
      [iconVarName]: url,
      mask: `var(${iconVarName}) no-repeat`,
      '-webkit-mask': `var(${iconVarName}) no-repeat`,
      maskSize: '100% 100%',
      '-webkit-mask-size': '100% 100%',
      backgroundColor: 'currentColor',
      ...iconDimensions,
      ...cssDefaults
    }
  }

  return {
    [iconVarName]: url,
    background: `var(${iconVarName}) no-repeat`,
    backgroundSize: '100% 100%',
    backgroundColor: 'transparent',
    ...iconDimensions,
    ...cssDefaults
  }
}

function getIconCssAsColorFunction(
  icon: LoadedIcon,
  scale: number,
  cssDefaults: CSSRuleObject
) {
  return (color: string): CSSRuleObject => {
    const coloredBody = icon.body.replace(/currentColor/g, color)
    const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${coloredBody}</svg>`
    const url = `url("data:image/svg+xml,${encodeSvg(svg)}")`

    return {
      [iconVarName]: url,
      background: `var(${iconVarName}) no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent',
      ...getIconDimensions(icon, scale),
      ...cssDefaults
    }
  }
}

const cache = new IconifyFileCache(path.resolve(__dirname, 'cache'))

type ResolveIconSetsCallback = (
  iconSetName: string,
  iconSetOptions: IconSetOptions,
  iconifyJson: IconifyJSON
) => void

function resolveIconSets(
  iconSetOptionsRecord: IconSetOptionsRecord,
  callback: ResolveIconSetsCallback
) {
  const iconSetNamesToFetch: string[] = []

  for (const [iconSetName, iconSetOptions] of Object.entries(
    iconSetOptionsRecord
  )) {
    iconSetOptions.icons ??= {}

    const kebabCaseIconSetName = toKebabCase(iconSetName)

    // If there is no location, try and resolve from common iconify module locations
    if (!iconSetOptions.location) {
      try {
        // When the icon sets are installed individually
        const jsonPath = require.resolve(
          `@iconify-json/${kebabCaseIconSetName}/icons.json`
        )

        callback(
          kebabCaseIconSetName,
          iconSetOptions,
          JSON.parse(fs.readFileSync(jsonPath, 'ascii'))
        )
        continue
      } catch {}

      try {
        // When the global JSON is installed
        const jsonPath = require.resolve(
          `@iconify/json/json/${kebabCaseIconSetName}.json`
        )

        callback(
          kebabCaseIconSetName,
          iconSetOptions,
          JSON.parse(fs.readFileSync(jsonPath, 'ascii'))
        )
        continue
      } catch {}

      throw new Error(
        `Icon set "${iconSetName}" not found. Try installing it with "npm install @iconify/${kebabCaseIconSetName}"`
      )
    }

    // If the location is a URI, try and resolve the icons JSON from the cache;
    // otherwise, prepare to fetch them
    if (isUri(iconSetOptions.location)) {
      if (cache.has(iconSetOptions.location)) {
        callback(
          kebabCaseIconSetName,
          iconSetOptions,
          cache.get(iconSetOptions.location)!
        )
      } else {
        iconSetNamesToFetch.push(iconSetName)
      }
      continue
    }

    let resolvedLocation

    try {
      // Try to resolve the location as a module
      resolvedLocation = require.resolve(iconSetOptions.location)
    } catch {
      // Otherwise resolve from the file system
      resolvedLocation = path.resolve(iconSetOptions.location)
    }

    if (!fs.existsSync(resolvedLocation)) {
      throw new Error(
        `No icon set "${iconSetName}" found at location "${location}"`
      )
    }

    callback(
      kebabCaseIconSetName,
      iconSetOptions,
      JSON.parse(fs.readFileSync(resolvedLocation, 'ascii'))
    )

    continue
  }

  if (!iconSetNamesToFetch.length) {
    return
  }

  execFileSync(
    'node',
    [
      path.resolve(__dirname, 'fetch.mjs'),
      cache.cacheDir,
      ...iconSetNamesToFetch.map(
        iconSetName => iconSetOptionsRecord[iconSetName].location!
      )
    ],
    {
      stdio: 'pipe'
    }
  )

  for (const iconSetName of iconSetNamesToFetch) {
    const iconSetOptions = iconSetOptionsRecord[iconSetName]

    callback(
      toKebabCase(iconSetName),
      iconSetOptions,
      cache.get(iconSetOptions.location!)!
    )
  }
}

export const Icons = plugin.withOptions<TailwindcssPluginIconsOptions>(
  callback => pluginApi => {
    const iconSetOptionsRecord = callback(pluginApi)

    const components: Record<string, CSSRuleObject> = {}
    const backgroundComponents: Record<
      string,
      (color: string) => CSSRuleObject
    > = {}

    resolveIconSets(
      iconSetOptionsRecord,
      (iconSetName, { icons, scale }, iconifyJson) => {
        for (const [iconName, cssDefaults] of Object.entries(icons)) {
          const loadedIcon = loadIconFromJson(iconifyJson, iconName)

          if (loadedIcon.mode === 'bg') {
            backgroundComponents[`bg-${iconSetName}-${loadedIcon.name}`] =
              getIconCssAsColorFunction(loadedIcon, scale ?? 1, cssDefaults)
          } else {
            components[`.i-${iconSetName}-${loadedIcon.name}`] = getIconCss(
              loadedIcon,
              scale ?? 1,
              cssDefaults
            )
          }
        }
      }
    )

    pluginApi.addComponents(components)
    pluginApi.matchComponents(backgroundComponents, {
      values: flattenColorPalette(pluginApi.theme('colors')),
      type: ['color', 'any']
    })
  }
)

export type IconSetOptions = {
  icons: Record<string, CSSRuleObject>
  scale?: number
  location?: string
}

export type IconSetOptionsRecord = {
  [key: string]: IconSetOptions
}

export type TailwindcssPluginIconsOptions = (
  pluginApi: PluginAPI
) => IconSetOptionsRecord
