import { expect, test } from 'vitest'

import { uriToFilename } from '../src/lib.mjs'

test.each(['https://example.com', 'a', 'b', 'c'])('%s', value => {
  const actual = uriToFilename(value)
  expect(actual).toMatchSnapshot()
})
