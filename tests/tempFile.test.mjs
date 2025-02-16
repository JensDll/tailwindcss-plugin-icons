import { test, expect } from 'vitest'

import { tempDirSnapshot } from './tempDir.mjs'
import { TempFile } from '../src/lib.mjs'

test('creates temporary file and renames it when disposed', async () => {
  const temp = new TempFile('test.txt')
  const file = await temp.open('ascii')

  const snapshot = await tempDirSnapshot()
  expect(snapshot).toHaveLength(1)
  expect(snapshot[0][1]).toBe('')

  file.end('Hello, World!\n')

  await temp[Symbol.asyncDispose]()

  expect(file.closed).toBe(true)
  expect(await tempDirSnapshot()).toMatchSnapshot()
})
