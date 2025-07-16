import { expect, test } from 'vitest'

import { toFixedRemoveTrailingZeros } from '../src/lib.mjs'

test.each([
  { value: 0.5, expected: '0.5' },
  { value: 0.123456, expected: '0.1235' },
  { value: 0.123446, expected: '0.1234' },
  { value: 0.34, expected: '0.34' },
  { value: 0.345, expected: '0.345' },
  { value: 0.3456, expected: '0.3456' },
  { value: 0.999, expected: '0.999' },
  { value: 0.2001, expected: '0.2001' },
  { value: 0.20001, expected: '0.2' },
  { value: 0.20009, expected: '0.2001' },
])('to fixed $value', ({ value, expected }) => {
  const actual = toFixedRemoveTrailingZeros(value)
  expect(actual).toBe(expected)
})
