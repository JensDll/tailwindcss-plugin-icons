import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'

import { isUri, loadIconFromIconifyJson, toKebabCase } from '@internal/shared'
import type { IconifyJSON } from '@iconify/types'
import type { CSSRuleObject, PluginAPI } from 'tailwindcss/types/config'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import plugin from 'tailwindcss/plugin'

import { IconifyFileCache } from '~tailwindcss-plugin-icons/cache'
import {
  type CSSRuleObjectWithMaybeScale,
  type CSSRuleObjectWithScale,
  type ColorFunction,
  SCALE,
  getIconCss,
  getIconCssAsColorFunction
} from '~tailwindcss-plugin-icons/css'

export { SCALE } from '~tailwindcss-plugin-icons/css'

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
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
          throw e
        }
      }

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
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') {
          throw e
        }
      }

      throw new Error(
        `Icon set "${iconSetName}" not found. Try installing it with "npm install @iconify-json/${kebabCaseIconSetName}"`
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
        `No icon set "${iconSetName}" found at location "${iconSetOptions.location}"`
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

export const Icons = plugin.withOptions<Options>(callback => pluginApi => {
  const iconSetOptionsRecord = callback(pluginApi)

  const components: Record<string, CSSRuleObject> = {}
  const backgroundComponents: Record<string, ColorFunction> = {}

  try {
    resolveIconSets(
      iconSetOptionsRecord,
      (iconSetName, { icons, scale }, iconifyJson) => {
        for (const [iconName, cssDefaults] of Object.entries(icons)) {
          const loadedIcon = loadIconFromIconifyJson(iconifyJson, iconName)

          Object.defineProperty(cssDefaults, SCALE, {
            value: cssDefaults[SCALE] || scale || 1,
            enumerable: false,
            writable: false,
            configurable: false
          })

          if (loadedIcon.mode === 'bg') {
            backgroundComponents[`bg-${iconSetName}-${loadedIcon.name}`] =
              getIconCssAsColorFunction(
                loadedIcon,
                cssDefaults as CSSRuleObjectWithScale
              )
          } else {
            components[`.i-${iconSetName}-${loadedIcon.name}`] = getIconCss(
              loadedIcon,
              cssDefaults as CSSRuleObjectWithScale
            )
          }
        }
      }
    )
  } catch (e) {
    console.error(e)
    return
  }

  pluginApi.addComponents(components)
  pluginApi.matchComponents(backgroundComponents, {
    values: flattenColorPalette(pluginApi.theme('colors')),
    type: ['color', 'any']
  })
})

export type IconSetOptions = {
  icons: Record<string, CSSRuleObjectWithMaybeScale>
  scale?: number
  location?: string
}

export type IconSetOptionsRecord = {
  [key: string]: IconSetOptions
}

export type Options = (pluginApi: PluginAPI) => IconSetOptionsRecord
