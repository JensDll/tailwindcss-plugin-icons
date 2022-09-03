import { type LoadedIcon, encodeSvg } from '@internal/shared'
import type { CSSRuleObject } from 'tailwindcss/types/config'

export const SCALE = Symbol('Used to apply icon-specific scaling')

export interface CSSRuleObjectWithMaybeScale extends CSSRuleObject {
  [SCALE]?: number
}

export type CSSRuleObjectWithScale = Required<CSSRuleObjectWithMaybeScale>

const URL_VAR_NAME = '--tw-plugin-icons-url'

function getIconDimensions(icon: LoadedIcon, scale: number) {
  return {
    width: `${(icon.width / icon.height) * scale}em`,
    height: `${scale}em`
  }
}

export function getIconCss(
  icon: LoadedIcon,
  cssDefaults: CSSRuleObjectWithScale
) {
  const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${icon.body}</svg>`
  const url = `url("data:image/svg+xml;utf8,${encodeSvg(svg)}")`

  const iconDimensions = getIconDimensions(icon, cssDefaults[SCALE])

  if (icon.mode === 'mask') {
    return {
      [URL_VAR_NAME]: url,
      mask: `var(${URL_VAR_NAME}) no-repeat`,
      '-webkit-mask': `var(${URL_VAR_NAME}) no-repeat`,
      maskSize: '100% 100%',
      '-webkit-mask-size': '100% 100%',
      backgroundColor: 'currentColor',
      ...iconDimensions,
      ...cssDefaults
    }
  }

  return {
    [URL_VAR_NAME]: url,
    background: `var(${URL_VAR_NAME}) no-repeat`,
    backgroundSize: '100% 100%',
    backgroundColor: 'transparent',
    ...iconDimensions,
    ...cssDefaults
  }
}

export type ColorFunction = (color: string) => CSSRuleObject

export function getIconCssAsColorFunction(
  icon: LoadedIcon,
  cssDefaults: CSSRuleObjectWithScale
): ColorFunction {
  return color => {
    const coloredBody = icon.body.replace(/currentColor/g, color)
    const svg = `<svg viewBox="${icon.left} ${icon.top} ${icon.width} ${icon.height}">${coloredBody}</svg>`
    const url = `url("data:image/svg+xml,${encodeSvg(svg)}")`

    return {
      [URL_VAR_NAME]: url,
      background: `var(${URL_VAR_NAME}) no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent',
      ...getIconDimensions(icon, cssDefaults[SCALE]),
      ...cssDefaults
    }
  }
}
