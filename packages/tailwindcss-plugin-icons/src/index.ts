import fs from 'fs'

import plugin from 'tailwindcss/plugin'
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'

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
    location: string
  }
}

function encodeSvg(svg: string) {
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

const getIconAsMask = (body: string, width: number, height: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${width} ${height}">${body}</svg>`
  const mode = svg.includes('currentColor') ? 'mask' : 'background'
  const uri = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  if (mode === 'mask') {
    return {
      mask: `${uri} no-repeat`,
      maskSize: '100% 100%',
      backgroundColor: 'currentColor'
    }
  } else {
    return {
      background: `${uri} no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }
}

const getIconAsBackground =
  (body: string, width: number, height: number) => (color: string) => {
    const coloredBody = body.replace(/currentColor/g, color)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 ${width} ${height}">${coloredBody}</svg>`
    const uri = `url("data:image/svg+xml,${encodeSvg(svg)}")`

    return {
      background: `${uri} no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
    }
  }

export function Icons(options: Options) {
  options.asMask ??= {}
  options.asBackground ??= {}

  if (options.custom?.asMask) {
    options.asMask.custom = options.custom.asMask
  }

  if (options.custom?.asBackground) {
    options.asBackground.custom = options.custom.asBackground
  }

  const asMask: Record<string, unknown> = {}
  const asBackground: Record<string, unknown> = {}

  for (const [iconSetName, iconNames] of Object.entries(options.asMask)) {
    const iconSet = JSON.parse(
      fs.readFileSync(
        iconSetName === 'custom'
          ? options!.custom!.location
          : require.resolve(`@iconify-json/${iconSetName}/icons.json`),
        'ascii'
      )
    )

    for (const iconName of iconNames ?? []) {
      asMask[`.i-${iconSetName}-${iconName}`] = getIconAsMask(
        iconSet.icons[iconName].body,
        iconSet.width,
        iconSet.height
      )
    }
  }

  for (const [iconSetName, iconNames] of Object.entries(options.asBackground)) {
    const iconSet = JSON.parse(
      fs.readFileSync(
        iconSetName === 'custom'
          ? options!.custom!.location
          : require.resolve(`@iconify-json/${iconSetName}/icons.json`),
        'ascii'
      )
    )

    for (const iconName of iconNames ?? []) {
      asBackground[`bg-${iconSetName}-${iconName}`] = getIconAsBackground(
        iconSet.icons[iconName].body,
        iconSet.width,
        iconSet.height
      )
    }
  }

  return plugin(({ addUtilities, matchUtilities, theme }) => {
    addUtilities(asMask)

    matchUtilities(asBackground, {
      values: flattenColorPalette(theme('colors')),
      type: ['color', 'any']
    })
  })
}
