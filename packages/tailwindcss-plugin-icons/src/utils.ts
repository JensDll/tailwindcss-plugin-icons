export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function encodeSvg(svg: string) {
  return svg
    .replace(
      '<svg',
      ~svg.indexOf('xmlns') ? '<svg' : '<svg xmlns="http://www.w3.org/2000/svg"'
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

export type IconMode = 'bg' | 'mask'

export function loadIcon(iconifyJson: IconifyJson, iconName: string) {
  let { width, height, icons } = iconifyJson
  let mode: IconMode | undefined

  iconName = iconName.replace(/\?(bg|mask)$/, (...values) => {
    mode = values[1]
    return ''
  })

  const icon = icons[iconName]
  const body = icon.body

  if (icon.width) {
    width = icon.width
  }
  if (icon.height) {
    height = icon.height
  }

  mode ??= body.includes('currentColor') ? 'mask' : 'bg'

  return {
    width,
    height,
    mode,
    body,
    normalizedIconName: iconName
  }
}
