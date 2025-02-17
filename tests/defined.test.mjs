import { expect, test } from 'vitest'

import { defined } from '../src/lib.mjs'

test.each([
  { value: undefined, expected: false },
  { value: null, expected: false },
  { value: [], expected: true },
  { value: 0, expected: false },
  { value: '', expected: false },
  { value: 1, expected: true },
  { value: -1, expected: true },
  { value: 'a', expected: true },
])('defined $value', ({ value, expected }) => {
  const actual = defined(value)
  expect(actual).toBe(expected)
})
