import type {
  ExtendedIconifyIcon,
  IconifyDimenisons as IconifyDimensions,
  IconifyJSON,
  IconifyTransformations
} from '@iconify/types'

export type Awaitable<T> = T | Promise<T>

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function isPromise<T>(value: Awaitable<T>): value is Promise<T> {
  // @ts-expect-error
  return typeof value?.then === 'function'
}

export function isUri(str: string | undefined): str is string {
  return !str ? false : /^https?:/i.test(str)
}

export function uriToFilename(uri: string) {
  return uri.replace(/^https?:\/\//i, '').replace(/[/]/g, '')
}

export function encodeSvg(svg: string) {
  if (!svg.includes(' xmlns:xlink=') && svg.includes(' xlink:')) {
    // Add the "http://www.w3.org/1999/xlink" namespace for any icon using the xlink: prefix
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
    svg = svg.replace(
      '<svg ',
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '
    )
  }

  if (!svg.includes(' xmlns=')) {
    // Always add the "http://www.w3.org/2000/svg" default namespace, if it does not exist
    svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
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
  name: string
  body: string
  mode: IconMode
  left: number
  top: number
  width: number
  height: number
}

export function loadIconFromIconifyJson(
  iconifyJson: IconifyJSON,
  iconName: string
): LoadedIcon {
  let { left, top, width, height } = iconifyJson
  const { icons, aliases } = iconifyJson
  let mode: IconMode | undefined

  // Transform the icon name to kebab case and remove query parameters
  const normalizedIconName = toKebabCase(iconName).replace(
    /\?(bg|mask)$/,
    (...values) => {
      mode = values[1]
      return ''
    }
  )

  let icon: ExtendedIconifyIcon

  if (normalizedIconName in icons) {
    // Retrieve the icon from icons
    icon = icons[normalizedIconName]
  } else if (aliases && normalizedIconName in aliases) {
    // Retrieve the icon from aliases
    const { parent, ...aliasedIcon } = aliases[normalizedIconName]

    icon = {
      ...icons[parent],
      ...aliasedIcon
    }
  } else {
    throw new Error(`Icon "${normalizedIconName}" not found`)
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
  mode ??= icon.body.includes('currentColor') ? 'mask' : 'color'

  return {
    name: normalizedIconName,
    body: applyTransformations(icon.body, {
      left,
      top,
      width,
      height,
      rotate: icon.rotate,
      hFlip: icon.hFlip,
      vFlip: icon.vFlip
    }),
    mode,
    left,
    top,
    width,
    height
  }
}

interface IconifyPartialOptional
  extends Required<IconifyDimensions>,
    IconifyTransformations {}

function applyTransformations(
  body: string,
  { left, top, width, height, rotate, hFlip, vFlip }: IconifyPartialOptional
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
