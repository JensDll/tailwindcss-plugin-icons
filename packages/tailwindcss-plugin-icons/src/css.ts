import { type LoadedIcon, iconToDataUrl } from '@internal/shared'
import type { CSSRuleObject } from 'tailwindcss/types/config'

export const SCALE = Symbol('Icon-specific scaling')

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
  const iconUrl = iconToDataUrl(icon)
  const iconDimensions = getIconDimensions(icon, cssDefaults[SCALE])

  if (icon.mode === 'mask') {
    return {
      [URL_VAR_NAME]: iconUrl,
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
    [URL_VAR_NAME]: iconUrl,
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
    icon.body = icon.body.replace(/currentColor/g, color)

    return {
      [URL_VAR_NAME]: iconToDataUrl(icon),
      background: `var(${URL_VAR_NAME}) no-repeat`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent',
      ...getIconDimensions(icon, cssDefaults[SCALE]),
      ...cssDefaults
    }
  }
}
