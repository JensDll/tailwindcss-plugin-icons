import { expect, test } from 'vitest'

import { iconUrl } from '../src/lib.mjs'

test.for(
  /** @type {[string, number, number, number, number][]} */ ([
    ['', 1, 2, 3, 4],
    ['<path d="1 2 3"></path>', 10, 20, 30, 40],
    ['<use xlink:href="test"></use>', 3, 5, 7, 11],
  ]),
)('icon url %#', icon => {
  const actual = iconUrl(...icon)
  expect(actual).toMatchSnapshot()
})
