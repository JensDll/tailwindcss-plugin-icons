import { expect, test } from 'vitest'

import { iconTransform } from '../src/lib.mjs'

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
)('transform %#', icon => {
  const actual = iconTransform(...icon)
  expect(actual).toMatchSnapshot()
})
