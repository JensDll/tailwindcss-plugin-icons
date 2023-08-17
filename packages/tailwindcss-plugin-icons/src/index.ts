import child_process from 'child_process'
import fs from 'fs'
import path from 'path'

import type { IconifyJSON } from '@iconify/types'
import {
  TailwindcssPluginIconsError,
  isUri,
  loadIconFromIconifyJson,
  toKebabCase,
  readJson,
  type WithRequired,
} from '@internal/shared'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
import plugin from 'tailwindcss/plugin'
import type { CSSRuleObject, PluginAPI } from 'tailwindcss/types/config'

import { IconifyFileCache } from '~tailwindcss-plugin-icons/cache'
import {
  type CSSRuleObjectWithMaybeScale,
  type CSSRuleObjectWithScale,
  type ColorFunction,
  SCALE,
  getIconCss,
  getIconCssAsColorFunction,
} from '~tailwindcss-plugin-icons/css'

export { SCALE } from '~tailwindcss-plugin-icons/css'

const cache = new IconifyFileCache(path.resolve(__dirname, 'cache'))

type IconSetOptionsWithIcons = WithRequired<IconSetOptions, 'icons'>

type ResolveIconSetsCallback = (
  iconSetName: string,
  iconSetOptions: IconSetOptionsWithIcons,
  iconifyJson: IconifyJSON,
) => void

function resolveIconSets(
  iconSetOptionsRecord: IconSetOptionsRecord,
  callback: ResolveIconSetsCallback,
) {
  const locationsToFetch: string[] = []
  const afterFetchCallbacks: (() => void)[] = []

  for (const [iconSetName, iconSetOptions] of Object.entries(
    iconSetOptionsRecord,
  )) {
    iconSetOptions.icons ??= {}

    const kebabCaseIconSetName = toKebabCase(iconSetName)

    // If there is no location, try and resolve from common iconify module locations
    if (!iconSetOptions.location) {
      try {
        // When "@iconify-json/[icon-set-name]" is installed
        const jsonPath = require.resolve(
          `@iconify-json/${kebabCaseIconSetName}/icons.json`,
        )

        callback(
          kebabCaseIconSetName,
          iconSetOptions as IconSetOptionsWithIcons,
          readJson(jsonPath),
        )
        continue
      } catch (e) {
        TailwindcssPluginIconsError.rethrowIfInstanceof(e)
      }

      try {
        // When "@iconify/json" is installed
        const jsonPath = require.resolve(
          `@iconify/json/json/${kebabCaseIconSetName}.json`,
        )

        callback(
          kebabCaseIconSetName,
          iconSetOptions as IconSetOptionsWithIcons,
          readJson(jsonPath),
        )
        continue
      } catch (e) {
        TailwindcssPluginIconsError.rethrowIfInstanceof(e)
      }

      throw new TailwindcssPluginIconsError(
        `Icon set "${iconSetName}" not found. Please see if the name is correct or try installing it with "npm install @iconify-json/${kebabCaseIconSetName}"`,
      )
    }

    // If the location is a URI, try and resolve from the cache; otherwise, prepare to fetch
    if (isUri(iconSetOptions.location)) {
      if (cache.has(iconSetOptions.location)) {
        callback(
          kebabCaseIconSetName,
          iconSetOptions as IconSetOptionsWithIcons,
          cache.get(iconSetOptions.location)!,
        )
      } else {
        locationsToFetch.push(iconSetOptions.location)
        afterFetchCallbacks.push(() => {
          callback(
            kebabCaseIconSetName,
            iconSetOptions as IconSetOptionsWithIcons,
            cache.get(iconSetOptions.location!)!,
          )
        })
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
      throw new TailwindcssPluginIconsError(
        `Failed to find icon set at location "${iconSetOptions.location}"`,
      )
    }

    callback(
      kebabCaseIconSetName,
      iconSetOptions as IconSetOptionsWithIcons,
      readJson(resolvedLocation),
    )

    continue
  }

  if (!locationsToFetch.length) {
    return
  }

  child_process.execFileSync(
    'node',
    [path.resolve(__dirname, 'fetch.mjs'), cache.cacheDir, ...locationsToFetch],
    {
      stdio: 'pipe',
    },
  )

  afterFetchCallbacks.forEach(cb => cb())
}

type Components = Record<string, CSSRuleObject>
type BackgroundComponents = Record<string, ColorFunction>

type AddIconOptions = {
  iconifyJson: IconifyJSON
  iconSetName: string
  iconName: string
  scale?: number | ScaleFactory
  cssDefaults?: CSSRuleObjectWithMaybeScale
}

const addIconToComponents =
  (components: Components, backgroundComponents: BackgroundComponents) =>
  ({
    iconifyJson,
    iconName,
    iconSetName,
    cssDefaults = {},
    scale = 1,
  }: AddIconOptions) => {
    const loadedIcon = loadIconFromIconifyJson(iconifyJson, iconName)

    Object.defineProperty(cssDefaults, SCALE, {
      value:
        cssDefaults[SCALE] ??
        (typeof scale === 'function' ? scale(iconName) : scale),
      enumerable: false,
      writable: false,
      configurable: false,
    })

    if (loadedIcon.mode === 'bg') {
      backgroundComponents[`bg-${iconSetName}-${loadedIcon.normalizedName}`] =
        getIconCssAsColorFunction(
          loadedIcon,
          cssDefaults as CSSRuleObjectWithScale,
        )
    } else {
      components[`.i-${iconSetName}-${loadedIcon.normalizedName}`] = getIconCss(
        loadedIcon,
        cssDefaults as CSSRuleObjectWithScale,
      )
    }

    return loadedIcon
  }

export const Icons = plugin.withOptions<Options>(options => pluginApi => {
  const components: Components = {}
  const backgroundComponents: BackgroundComponents = {}
  const addIcon = addIconToComponents(components, backgroundComponents)

  const onResolve: ResolveIconSetsCallback = (
    iconSetName,
    { icons, scale, includeAll },
    iconifyJson,
  ) => {
    if (includeAll) {
      Object.keys(iconifyJson.icons).forEach(iconName => {
        addIcon({ iconifyJson, iconName, iconSetName, scale })
      })

      if (iconifyJson.aliases) {
        Object.keys(iconifyJson.aliases).forEach(iconName => {
          addIcon({ iconifyJson, iconName, iconSetName, scale })
        })
      }
    }

    Object.entries(icons).forEach(([iconName, cssDefaults]) => {
      addIcon({ iconifyJson, iconName, iconSetName, cssDefaults, scale })
    })
  }

  try {
    resolveIconSets(options(pluginApi), onResolve)
  } catch (e) {
    if (e instanceof Error) {
      console.error('[TailwindcssPluginIcons]', e.message)
    }

    return
  }

  pluginApi.addComponents(components)
  pluginApi.matchComponents(backgroundComponents, {
    values: flattenColorPalette(pluginApi.theme('colors')),
    type: ['color', 'any'],
  })
})

export type ScaleFactory = (iconName: string) => number

export type IconSetOptions = {
  /**
   * An object describing the selected icons with optional default CSS.
   */
  icons?: Record<string, CSSRuleObjectWithMaybeScale>
  /**
   * A default scale used for all selected icons.
   * @default 1
   */
  scale?: number | ScaleFactory
  /**
   * The location of the icon source in Iconify JSON format. Can be any URI, local path, or module name.
   * @default "@iconify/json" or "@iconify-json/[name]"
   */
  location?: string
  /**
   * Choose to include every icon in the icon set.
   * @default false
   */
  includeAll?: boolean
}

export type IconSetOptionsRecord = Record<string, IconSetOptions>

export type Options = (pluginApi: PluginAPI) => IconSetOptionsRecord
