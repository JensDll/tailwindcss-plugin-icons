import { describe, test, expect } from 'vitest'

import {
  defined,
  iconTransform,
  iconUrl,
  isUri,
  toKebabCase,
} from './common.mjs'

describe('defined', () => {
  test.each([
    { value: undefined, expected: false },
    { value: null, expected: false },
    { value: [], expected: true },
    { value: 0, expected: false },
    { value: '', expected: false },
    { value: 1, expected: true },
    { value: -1, expected: true },
    { value: 'a', expected: true },
  ])('$value', ({ value, expected }) => {
    const actual = defined(value)
    expect(actual).toBe(expected)
  })
})

describe('toKebabCase', () => {
  test.each([
    { value: 'heroiconsSolid', expected: 'heroicons-solid' },
    { value: 'HeroiconsSolid', expected: 'heroicons-solid' },
    { value: 'heroicons-Solid', expected: 'heroicons-solid' },
  ])('$value', ({ value, expected }) => {
    const actual = toKebabCase(value)
    expect(actual).toBe(expected)
  })
})

describe('isUri', () => {
  test.each([
    { value: 'https://example.com', expected: true },
    { value: 'http://example.com', expected: true },
    { value: 'http:/example.com', expected: false },
    { value: './src/icons.json', expected: false },
    { value: 'src/icons.json', expected: false },
    { value: '', expected: false },
    { value: undefined, expected: false },
    { value: null, expected: false },
  ])('$value', ({ value, expected }) => {
    const actual = isUri(value)
    expect(actual).toBe(expected)
  })
})

describe('iconUrl', () => {
  test.for(
    /** @type {[string, number, number, number, number][]} */ ([
      ['', 1, 2, 3, 4],
      ['<path d="1 2 3"></path>', 10, 20, 30, 40],
      ['<use xlink:href="test"></use>', 3, 5, 7, 11],
    ]),
  )('%#', icon => {
    const actual = iconUrl(...icon)
    expect(actual).toMatchSnapshot()
  })
})

describe('iconTransform', () => {
  test.for(
    /** @type {[string, number, number, number, number, number?, boolean?, boolean?][]} */ ([
      ['body', 1, 2, 3, 4],
      ['body', 5, 10, 50, 100, 1],
      ['body', 5, 10, 50, 100, 2],
      ['', 1, 1, 1, 1, undefined, true],
      ['', 1, 1, 1, 1, undefined, undefined, true],
      ['', 1, 2, 3, 4, 2, false, false],
      ['', 1, 2, 3, 4, 2, false, true],
      ['', 1, 2, 3, 4, 2, true, false],
      ['', 1, 2, 3, 4, 2, true, true],
    ]),
  )('%#', icon => {
    const actual = iconTransform(...icon)
    expect(actual).toMatchSnapshot()
  })
})
