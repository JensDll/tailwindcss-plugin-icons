import { defined, iconTransform, iconUrl } from './common.mjs'
import { TempFile } from './tempFile.mjs'

/**
 * @param {import('./plugin.mjs').Config} config
 * @param {import('./resolve.mjs').ResolveIconData} resolve
 */
export async function writeCss(config, resolve) {
  const {
    iconSets: configIconSets,
    prefix: { mask = 'mi', background = 'bi' } = {},
  } = config

  const iconSets = await resolveIconSets(configIconSets, resolve)
  const temp = new TempFile('plugin.css')

  try {
    const file = await temp.open()

    file.write('@theme {')
    await Promise.all(writeTheme(file, iconSets))
    file.write(`
}

@theme inline {`)
    await Promise.all(writeInlineTheme(file, iconSets))
    file.end(`
}

@utility ${mask}-* {
  & {
    mask-image: --value(--i-*);
    mask-repeat: no-repeat;
    mask-size: 100% 100%;
    background-color: currentColor;
    height: 1em;
    aspect-ratio: --value(--i-*--aspect);
  }
}

@utility ${background}-* {
  & {
    background-image: --value(--i-*);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    height: 1em;
    aspect-ratio: --value(--i-*--aspect);
  }
}
`)
  } finally {
    await temp[Symbol.asyncDispose]()
  }
}

/**
 * @param {import('fs').WriteStream} file
 * @param {any} iconSets
 * @return {Generator<Promise<void>, void, unknown>}
 */
function* writeTheme(file, iconSets) {
  for (const { name, icons } of iconSets) {
    if (icons.length === 0) {
      continue
    }

    yield new Promise(resolve => {
      const write = () => {
        let ok = true

        do {
          const icon = icons[i++]
          ok = file.write(`\n  --i-${name}-${icon.name}: ${icon.data};`)
        } while (ok && i < icons.length)

        if (i < icons.length) {
          file.once('drain', write)
        } else {
          resolve()
        }
      }
      let i = 0
      write()
    })
  }
}

/**
 * @param {import('fs').WriteStream} file
 * @param {any} iconSets
 * @return {Generator<Promise<void>, void, unknown>}
 */
function* writeInlineTheme(file, iconSets) {
  for (const { name, icons } of iconSets) {
    if (icons.length === 0) {
      continue
    }

    yield new Promise(resolve => {
      const write = () => {
        let ok = true

        do {
          const icon = icons[i++]
          const aspect =
            icon.width === icon.height
              ? 1
              : (icon.width / icon.height).toFixed(4)
          ok = file.write(`\n  --i-${name}-${icon.name}--aspect: ${aspect};`)
        } while (ok && i < icons.length)

        if (i < icons.length) {
          file.once('drain', write)
        } else {
          resolve()
        }
      }
      let i = 0
      write()
    })
  }
}

/**
 * @param {import('./plugin.mjs').ConfigIconSets} iconSets
 * @param {import('./resolve.mjs').ResolveIconData} resolve
 */
async function resolveIconSets(iconSets, resolve) {
  const entries = Object.entries(iconSets)
  const iconData = await Promise.all(entries.map(resolve))
  return entries.map((entry, i) => {
    const [iconSetName, { icons: iconNames }] = entry
    const {
      icons: iconSetIcons,
      aliases: iconSetAliases,
      info: iconSetInfo,
      left: iconSetLeft = 0,
      top: iconSetTop = 0,
      width: iconSetWidth = 16,
      height: iconSetHeight = 16,
    } = iconData[i]

    if (iconNames) {
      const icons = iconNames.map(name => {
        let icon

        if (name in iconSetIcons) {
          icon = iconSetIcons[name]
        } else if (iconSetAliases && name in iconSetAliases) {
          const { parent, ...aliasedIcon } = iconSetAliases[name]
          icon = { ...iconSetIcons[parent], ...aliasedIcon }
        } else {
          console.error(
            '[tailwindcss-plugin-icons] Icon "%s" not found%s',
            name,
            iconSetInfo ? ` in icon set "${iconSetInfo.name}"` : '',
          )
          return
        }

        const {
          body,
          left = iconSetLeft,
          top = iconSetTop,
          width = iconSetWidth,
          height = iconSetHeight,
          rotate,
          hFlip,
          vFlip,
        } = icon

        return {
          name,
          data: iconUrl(
            iconTransform(body, left, top, width, height, rotate, hFlip, vFlip),
            left,
            top,
            width,
            height,
          ),
          width,
          height,
        }
      })

      return { name: iconSetName, icons: icons.filter(defined) }
    }

    const icons = Object.entries(iconSetIcons).map(entry => {
      const [
        iconName,
        {
          body,
          left = iconSetLeft,
          top = iconSetTop,
          width = iconSetWidth,
          height = iconSetHeight,
          rotate,
          hFlip,
          vFlip,
        },
      ] = entry

      return {
        name: iconName,
        data: iconUrl(
          iconTransform(body, left, top, width, height, rotate, hFlip, vFlip),
          left,
          top,
          width,
          height,
        ),
        width,
        height,
      }
    })

    if (iconSetAliases) {
      icons.concat(
        Object.entries(iconSetAliases).map(entry => {
          const [iconName, alias] = entry
          const {
            body,
            left = iconSetLeft,
            top = iconSetTop,
            width = iconSetWidth,
            height = iconSetHeight,
            rotate,
            hFlip,
            vFlip,
          } = { ...alias, ...iconSetIcons[alias.parent] }

          return {
            name: iconName,
            data: iconUrl(
              iconTransform(
                body,
                left,
                top,
                width,
                height,
                rotate,
                hFlip,
                vFlip,
              ),
              left,
              top,
              width,
              height,
            ),
            width,
            height,
          }
        }),
      )
    }

    return { name: iconSetName, icons }
  })
}
