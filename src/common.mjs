import crypto from 'node:crypto'

/**
 * @template T
 * @param {T} value
 * @returns {values is Exclude<T, undefined | null>}
 */
export const defined = value => !!value

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
 * @param {import('crypto').BinaryLike} uri
 */
export function uriToFilename(uri) {
  return crypto.createHash('sha1').update(uri).digest('hex') + '.json'
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
 * @param {string} body
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 */
export function iconUrl(body, left, top, width, height) {
  // Always add the "http://www.w3.org/2000/svg" default namespace.
  // Add the "http://www.w3.org/1999/xlink" namespace for any icon using the xlink: prefix.
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Namespaces_Crash_Course
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
  /**
   * @type {string[]}
   */
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
