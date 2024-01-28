import crypto from 'crypto'
import fs from 'fs'

import type {
  ExtendedIconifyIcon,
  IconifyDimenisons as IconifyDimensions,
  IconifyJSON,
  IconifyTransformations,
} from '@iconify/types'

export type Nullable<T> = T | null | undefined

export type Awaitable<T> = T | Promise<T>

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

export class TailwindcssPluginIconsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TailwindcssPluginIconsError'
  }

  static rethrowIfInstanceof(error: unknown) {
    if (error instanceof TailwindcssPluginIconsError) {
      throw error
    }
  }
}

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function readJson(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

export function isUri(str: Nullable<string>): str is string {
  return !!str && /^https?:\/\//i.test(str)
}

export function uriToFilename(uri: string) {
  return crypto.createHash('sha1').update(uri).digest('hex')
}

export function encodeSvg(svg: string) {
  if (!svg.includes(' xmlns:xlink=') && svg.includes(' xlink:')) {
    // Add the "http://www.w3.org/1999/xlink" namespace for any icon using the xlink: prefix
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
    svg = svg.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"')
  }

  if (!svg.includes(' xmlns=')) {
    // Always add the "http://www.w3.org/2000/svg" default namespace, if it does not exist
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
  }

  return svg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\s+/g, ' ')
}

export type IconMode = 'bg' | 'mask' | 'color'

export interface LoadedIcon {
  readonly normalizedName: string
  readonly body: string
  readonly mode: IconMode
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

export type ParsedIconName = {
  readonly normalizedIconName: string
  readonly iconMode?: IconMode
}

export function parseIconName(iconName: string): ParsedIconName {
  let iconMode: IconMode | undefined
  // Transform the icon name to kebab case and remove query parameters
  const normalizedIconName = toKebabCase(iconName).replace(
    /\?(bg|mask)$/,
    (...values) => {
      iconMode = values[1]
      return ''
    },
  )

  return { normalizedIconName, iconMode }
}

export interface IconUrlOptions {
  /**
   * The left part of the top-left coordinate of the viewBox.
   * @default 0
   */
  readonly left?: number
  /**
   * The top part of the top-left coordinate of the viewBox.
   * @default 0
   */
  readonly top?: number
  /**
   * The width of the viewBox.
   */
  readonly width: number
  /**
   * The height of the viewBox.
   */
  readonly height: number
  /**
   * The body of the SVG.
   */
  readonly body: string
}

export function iconToDataUrl(icon: IconUrlOptions, body = icon.body) {
  const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${body}</svg>`
  return `url("data:image/svg+xml,${encodeSvg(svg)}")`
}

export function iconUrl({
  left = 0,
  top = 0,
  width,
  height,
  body,
}: IconUrlOptions) {
  return iconToDataUrl({ left, top, width, height, body })
}

export function loadIconFromIconifyJson(
  iconifyJson: IconifyJSON,
  iconName: string,
): LoadedIcon {
  const { icons, aliases, info } = iconifyJson
  let { left, top, width, height } = iconifyJson

  const parsedIconName = parseIconName(iconName)
  const { normalizedIconName } = parsedIconName
  let { iconMode } = parsedIconName

  let icon: ExtendedIconifyIcon

  if (normalizedIconName in icons) {
    // Retrieve the icon from icons
    icon = icons[normalizedIconName]
  } else if (aliases && normalizedIconName in aliases) {
    // Retrieve the icon from aliases
    const { parent, ...aliasedIcon } = aliases[normalizedIconName]

    icon = {
      ...icons[parent],
      ...aliasedIcon,
    }
  } else {
    throw new TailwindcssPluginIconsError(
      `Icon "${normalizedIconName}" not found${
        info ? ` in "${info.name}"` : ''
      }`,
    )
  }

  // Overwrite general values with icon specific ones, if they exist
  icon.left && (left = icon.left)
  icon.top && (top = icon.top)
  icon.width && (width = icon.width)
  icon.height && (height = icon.height)

  // Apply default values if none were found in the Iconify JSON
  left ??= 0
  top ??= 0
  width ??= 16
  height ??= 16
  iconMode ??= icon.body.includes('currentColor') ? 'mask' : 'color'

  return {
    normalizedName: normalizedIconName,
    body: applyTransformations(icon.body, {
      left,
      top,
      width,
      height,
      rotate: icon.rotate,
      hFlip: icon.hFlip,
      vFlip: icon.vFlip,
    }),
    mode: iconMode,
    left,
    top,
    width,
    height,
  }
}

interface IconifyPartialOptional
  extends Required<IconifyDimensions>,
    IconifyTransformations {}

function applyTransformations(
  body: string,
  { left, top, width, height, rotate, hFlip, vFlip }: IconifyPartialOptional,
): string {
  const transform: string[] = []

  if (rotate) {
    const centerX = (2 * left + width) / 2
    const centerY = (2 * top + height) / 2

    transform.push(`rotate(${rotate * 90} ${centerX} ${centerY})`)
  }

  if (hFlip) {
    transform.push(`translate(${2 * left + width} 0) scale(-1 1)`)
  }

  if (vFlip) {
    transform.push(`translate(0 ${2 * top + height}) scale(1 -1)`)
  }

  if (transform.length) {
    body = `<g transform="${transform.join(' ')}">${body}</g>`
  }

  return body
}
