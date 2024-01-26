import { type LoadedIcon, iconToDataUrl } from '@chunks/shared'
import { SCALE } from '@chunks/state'
import type { CSSRuleObject } from 'tailwindcss/types/config'

export interface CssRecordWithMaybeScale extends Record<string, unknown> {
  [SCALE]?: number
}

export type CssRecordWithScale = Required<CssRecordWithMaybeScale>

const URL_VAR_NAME = '--tw-plugin-icons-url'

function getIconDimensions(icon: LoadedIcon, scale: number) {
  return {
    width: `${(icon.width / icon.height) * scale}em`,
    height: `${scale}em`,
  }
}

export function getIconCss(icon: LoadedIcon, cssDefaults: CssRecordWithScale) {
  const iconUrl = iconToDataUrl(icon)
  const iconDimensions = getIconDimensions(icon, cssDefaults[SCALE])

  if (icon.mode === 'mask') {
    return {
      [URL_VAR_NAME]: iconUrl,
      mask: `var(${URL_VAR_NAME}) no-repeat`,
      maskSize: '100% 100%',
      backgroundColor: 'currentColor',
      ...iconDimensions,
      ...cssDefaults,
    }
  }

  return {
    [URL_VAR_NAME]: iconUrl,
    background: `var(${URL_VAR_NAME}) no-repeat`,
    backgroundSize: '100% 100%',
    ...iconDimensions,
    ...cssDefaults,
  }
}

export type ColorFunction = (
  color: string,
  extra: {
    modifier: unknown
  },
) => CSSRuleObject | null

export function getIconCssAsColorFunction(
  icon: LoadedIcon,
  cssDefaults: CssRecordWithScale,
): ColorFunction {
  return color => {
    return {
      [URL_VAR_NAME]: iconToDataUrl(
        icon,
        icon.body.replace(/currentColor/g, color),
      ),
      background: `var(${URL_VAR_NAME}) no-repeat`,
      backgroundSize: '100% 100%',
      ...getIconDimensions(icon, cssDefaults[SCALE]),
      ...cssDefaults,
    }
  }
}
