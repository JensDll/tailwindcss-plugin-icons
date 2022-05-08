export type Awaitable<T> = T | Promise<T>

export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function isPromise<T>(value: Awaitable<T>): value is Promise<T> {
  // @ts-expect-error
  return typeof value?.then === 'function'
}

export function isUri(str: string) {
  return /^https?:/i.test(str)
}

export function uriToFilename(key: string) {
  return key.replace(/^https?:\/\//i, '').replace(/[/]/g, '.')
}

export function encodeSvg(svg: string) {
  return svg
    .replace(
      '<svg',
      svg.includes('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'
    )
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/{/g, '%7B')
    .replace(/}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
}

export interface IconifyJson {
  icons: {
    [iconName: string]: {
      body: string
      width?: number
      height?: number
    }
  }
  width: number
  height: number
}

export type IconMode = 'bg' | 'mask' | 'color'

export function loadIconFromJson(iconifyJson: IconifyJson, iconName: string) {
  let { width, height, icons } = iconifyJson
  let mode: IconMode | undefined

  const normalizedIconName = iconName.replace(/\?(bg|mask)$/, (...values) => {
    mode = values[1]
    return ''
  })

  const icon = icons[normalizedIconName]
  const body = icon.body

  if (icon.width) {
    width = icon.width
  }

  if (icon.height) {
    height = icon.height
  }

  mode ??= body.includes('currentColor') ? 'mask' : 'color'

  return {
    width,
    height,
    mode,
    body,
    normalizedIconName
  }
}
