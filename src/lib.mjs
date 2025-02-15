import crypto from 'node:crypto'
import { createWriteStream } from 'node:fs'
import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import stream from 'node:stream/promises'

const CONSOLE_ERROR_NAMESPACE = '[tailwindcss-plugin-icons]'

/**
 * @template T
 * @param {T} value
 * @returns {value is NonNullable<T>}
 */
export function defined(value) {
  return !!value
}

/**
 * @typedef {object} PromiseWithResolvers
 * @prop {Promise<any>} promise
 * @prop {(value?: any) => any} resolve
 * @prop {(reason?: any) => any} reject
 */

/**
 * @returns {PromiseWithResolvers}
 */
export function withResolvers() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  // @ts-ignore
  return { promise, resolve, reject }
}

/**
 * @param {string} str
 */
export function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * @param {string} [str]
 * @returns {str is string}
 */
export function isUri(str) {
  return !!str && /^https?:\/\//i.test(str)
}

/**
 * @param {string} uri
 */
export function uriToFilename(uri) {
  return crypto.createHash('sha1').update(uri).digest('hex') + '.json'
}

/**
 * @param {string} uri
 * @returns {Promise<void>}
 */
export function fetchPipe(uri) {
  const protocol = uri.startsWith('https') ? https : http
  const filePath = new URL(uriToFilename(uri), import.meta.url)
  const file = createWriteStream(filePath)
  const error = new Error(`Failed to fetch remote icon set at "${uri}"`)
  return new Promise((resolve, reject) => {
    protocol
      .get(uri, async response => {
        if (response.statusCode === 200) {
          file.on('finish', resolve)
          response.pipe(file)
        } else {
          response.resume()
          await fs.unlink(filePath)
          reject(error)
        }
      })
      .on('error', async () => {
        await fs.unlink(filePath)
        reject(error)
      })
  })
}

/**
 * @param {string} svg
 */
function encodeSvg(svg) {
  return svg
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\s+/g, ' ')
}

/**
 * Converts an icon to a percent-encoded `<svg></svg>` CSS data URL.
 * @param {string} body The icon body.
 * @param {number} left The left part of the top-left coordinate of the `viewBox`.
 * @param {number} top The top part of the top-left coordinate of the `viewBox`.
 * @param {number} width The width of the `viewBox`.
 * @param {number} height The height of the `viewBox`.
 */
export function iconUrl(body, left, top, width, height) {
  // - Always add the "http://www.w3.org/2000/svg" default namespace.
  // - Add the "http://www.w3.org/1999/xlink" namespace for any icon using the xlink: prefix.
  // See https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
  const svg = body.includes(' xlink:')
    ? `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${left} ${top} ${width} ${height}">${body}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${width} ${height}">${body}</svg>`
  return `url("data:image/svg+xml,${encodeSvg(svg)}")`
}

/**
 * @param {string} body
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 * @param {number} [rotate]
 * @param {boolean} [hFlip]
 * @param {boolean} [vFlip]
 */
export function iconTransform(
  body,
  left,
  top,
  width,
  height,
  rotate,
  hFlip,
  vFlip,
) {
  const transform = []

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

/**
 * @typedef {object} IconsConfig
 * @prop {IconsConfigIconSet[]} iconSets
 * @prop {IconsConfigPrefix} [prefix]
 */

/**
 * @typedef {object} IconsConfigIconSet
 * @prop {string} name
 * @prop {string[]} [icons]
 * @prop {string} [location]
 */

/**
 * @typedef {object} IconsConfigPrefix
 * @prop {string} [mask]
 * @prop {string} [background]
 */

/**
 * @param {IconsConfig} config
 * @param {string} root
 */
export async function transformConfig(config, root) {
  try {
    await stream.pipeline(
      loadIconData(config.iconSets, root),
      transform,
      writeToFile(config.prefix),
    )
  } catch (e) {
    console.error(CONSOLE_ERROR_NAMESPACE, e)
  }
}

/**
 * @typedef {object} IconData
 * @prop {string} name
 * @prop {string[]} [names]
 * @prop {Record<string, IconDataIcon>} icons
 * @prop {Record<string, IconDataAlias>} [aliases]
 * @prop {number} [left]
 * @prop {number} [top]
 * @prop {number} [width]
 * @prop {number} [height]
 */

/**
 * @typedef {object} IconDataIcon
 * @prop {string} body
 * @prop {number} [left]
 * @prop {number} [top]
 * @prop {number} [width]
 * @prop {number} [height]
 * @prop {number} [rotate]
 * @prop {boolean} [hFlip]
 * @prop {boolean} [vFlip]
 */

/**
 * @typedef {object} IconDataAlias
 * @prop {string} parent
 * @prop {number} [left]
 * @prop {number} [top]
 * @prop {number} [width]
 * @prop {number} [height]
 * @prop {number} [rotate]
 * @prop {boolean} [hFlip]
 * @prop {boolean} [vFlip]
 */

/**
 * @param {IconsConfigIconSet[]} iconSets
 * @param {string} root
 */
export async function* loadIconData(iconSets, root) {
  for (const description of iconSets) {
    yield _loadIconData(description, root)
  }
}

/**
 * @param {IconsConfigIconSet} description
 * @param {string} root
 * @returns {Promise<IconData>}
 */
export async function _loadIconData(description, root) {
  const { name: originalName, icons: names, location } = description
  const name = toKebabCase(originalName)

  if (!location) {
    try {
      const {
        default: { icons, aliases, left, top, width, height },
      } = await import(`@iconify-json/${name}/icons.json`, {
        with: { type: 'json' },
      })
      return { name, names, icons, aliases, left, top, width, height }
    } catch {}

    try {
      const {
        default: { icons, aliases, left, top, width, height },
      } = await import(`@iconify/json/json/${name}.json`, {
        with: { type: 'json' },
      })
      return { name, names, icons, aliases, left, top, width, height }
    } catch {}

    throw new Error(
      `Icon set "${originalName}" not found. Please see if the name is correct or try installing it with "npm install @iconify-json/${name}"`,
    )
  }

  if (isUri(location)) {
    const path = new URL(uriToFilename(location), import.meta.url)

    try {
      const {
        default: { icons, aliases, left, top, width, height },
        // @ts-ignore
      } = await import(path, { with: { type: 'json' } })
      return { name, names, icons, aliases, left, top, width, height }
    } catch {}

    await fetchPipe(location)

    const {
      default: { icons, aliases, left, top, width, height },
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/42866
    } = await import(path, { with: { type: 'json' } })
    return { name, names, icons, aliases, left, top, width, height }
  }

  try {
    const {
      default: { icons, aliases, left, top, width, height },
    } = await import(location, { with: { type: 'json' } })
    return { name, names, icons, aliases, left, top, width, height }
  } catch {}

  let fileHandle

  try {
    fileHandle = await fs.open(path.join(root, location))
    const { icons, aliases, left, top, width, height } = JSON.parse(
      await fileHandle.readFile('utf8'),
    )
    return { name, names, icons, aliases, left, top, width, height }
  } catch {
    throw new Error(`Failed to find icon set at location "${location}"`)
  } finally {
    await fileHandle?.close()
  }
}

/**
 * @typedef {object} TransformIconData
 * @prop {string} iconSetName
 * @prop {TransformIconDataIcon[]} icons
 */

/**
 * @typedef {object} TransformIconDataIcon
 * @prop {string} name Icon name
 * @prop {string} data Icon data url
 * @prop {number} width Icon width
 * @prop {number} height Icon height
 */

/**
 * @param {AsyncIterable<IconData>} source
 */
export async function* transform(source) {
  for await (const {
    name: iconSetName,
    names,
    icons,
    aliases = {},
    left: _left = 0,
    top: _top = 0,
    width: _width = 16,
    height: _height = 16,
  } of source) {
    yield {
      iconSetName,
      icons: names
        ? names
            .map(name => {
              let icon

              if (name in icons) {
                icon = icons[name]
              } else if (name in aliases) {
                const { parent, ...aliasedIcon } = aliases[name]
                icon = { ...icons[parent], ...aliasedIcon }
              } else {
                console.error(
                  `${CONSOLE_ERROR_NAMESPACE} Icon "${name}" not found in icon set ${iconSetName}`,
                )
                return
              }

              const {
                body,
                left = _left,
                top = _top,
                width = _width,
                height = _height,
                rotate,
                hFlip,
                vFlip,
              } = icon

              return {
                name,
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
            })
            .filter(defined)
        : Object.entries(icons)
            .map(pair => {
              const [
                name,
                {
                  body,
                  left = _left,
                  top = _top,
                  width = _width,
                  height = _height,
                  rotate,
                  hFlip,
                  vFlip,
                },
              ] = pair

              return {
                name,
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
            })
            .concat(
              Object.entries(aliases).map(pair => {
                const [name, alias] = pair
                const {
                  body,
                  left = _left,
                  top = _top,
                  width = _width,
                  height = _height,
                  rotate,
                  hFlip,
                  vFlip,
                } = { ...alias, ...icons[alias.parent] }

                return {
                  name,
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
            ),
    }
  }
}

/**
 * @param {IconsConfigPrefix} [prefix]
 */
export function writeToFile(prefix = {}) {
  const { mask = 'mi', background = 'bi' } = prefix

  /**
   * @param {AsyncIterable<TransformIconData>} source
   */
  return async source => {
    const tempPath = new URL(crypto.randomUUID(), import.meta.url)

    const { promise, resolve, reject } = withResolvers()

    const file = createWriteStream(tempPath, {
      encoding: 'ascii',
    })
      .on('finish', async () => {
        console.log('commit file')
        await fs.rename(tempPath, new URL('plugin.css', import.meta.url))
        resolve()
      })
      .on('error', reject)

    for await (const { iconSetName, icons } of source) {
      const { promise: writeThemePromise, resolve: resolveWriteTheme } =
        withResolvers()

      const writeTheme = () => {
        let ok = true

        while (i < icons.length && ok) {
          const { name, data } = icons[i++]
          file.write('  --i-')
          file.write(iconSetName)
          file.write('-')
          file.write(name)
          file.write(': ')
          file.write(data)
          ok = file.write(';\n')
        }

        if (i < icons.length) {
          file.once('drain', writeTheme)
        } else {
          resolveWriteTheme()
        }
      }

      const {
        promise: writeInlineThemePromise,
        resolve: resolveWriteInlineTheme,
      } = withResolvers()

      const writeInlineTheme = () => {
        let ok = true

        while (i < icons.length && ok) {
          const { name, width, height } = icons[i++]
          file.write('  --i-')
          file.write(iconSetName)
          file.write('-')
          file.write(name)
          file.write('--aspect: ')
          file.write(width === height ? '1' : (width / height).toFixed(4))
          ok = file.write(';\n')
        }

        if (i < icons.length) {
          file.once('drain', writeInlineTheme)
        } else {
          resolveWriteInlineTheme()
        }
      }

      file.write('@theme {\n')

      let i = 0
      writeTheme()
      await writeThemePromise

      file.write(`}

@theme inline reference {
`)

      i = 0
      writeInlineTheme()
      await writeInlineThemePromise

      file.write('}\n\n')
    }

    file.end(`@utility ${mask}-* {
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

    return promise
  }
}
