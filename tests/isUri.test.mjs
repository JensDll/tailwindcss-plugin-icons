import { expect, test } from 'vitest'

import { isUri } from '../src/lib.mjs'

test.each([
  { value: 'https://example.com', expected: true },
  { value: 'http://example.com', expected: true },
  { value: 'http:/example.com', expected: false },
  { value: './src/icons.json', expected: false },
  { value: 'src/icons.json', expected: false },
  { value: '', expected: false },
  { value: undefined, expected: false },
  { value: null, expected: false },
])('is uri $value', ({ value, expected }) => {
  const actual = isUri(value)
  expect(actual).toBe(expected)
})
