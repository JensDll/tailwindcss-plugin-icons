import { expect, test } from 'vitest'

import { toKebabCase } from '../src/lib.mjs'

test.each([
  { value: 'heroiconsSolid', expected: 'heroicons-solid' },
  { value: 'HeroiconsSolid', expected: 'heroicons-solid' },
  { value: 'heroicons-Solid', expected: 'heroicons-solid' },
])('$value', ({ value, expected }) => {
  const actual = toKebabCase(value)
  expect(actual).toBe(expected)
})
