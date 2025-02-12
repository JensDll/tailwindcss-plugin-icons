import { fs, vol } from 'memfs'
import { toSnapshotSync } from 'memfs/lib/snapshot'
import { vi, beforeEach, test, expect } from 'vitest'

import { TempFile } from './tempFile.mjs'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
})

test('creates temporary file and renames it when disposed', async () => {
  const temp = new TempFile('test.txt')
  const file = await temp.open()
  const folder = toSnapshotSync({ fs, path: '/' })
  expect(Object.keys(folder[2])).toStrictEqual([expect.any(String)])
  expect(Object.values(folder[2])).toStrictEqual([[1, {}, new Uint8Array()]])
  file.end('Hello, World!\n')
  await temp[Symbol.asyncDispose]()
  expect(file.closed).toBe(true)
  expect(toSnapshotSync({ fs, path: '/' })).toMatchSnapshot()
})
