import { test, vi, beforeAll, afterAll, beforeEach, expect } from 'vitest'

import { server, handlers } from './server.mjs'
import { fs, vol } from 'memfs'
import { toSnapshotSync } from 'memfs/lib/snapshot'
import { fetchPipe } from '~/src/lib.mjs'

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  vol.reset()
})

afterAll(() => {
  server.close()
})

test('works with http', async () => {
  await fetchPipe(handlers.httpIcons.path)
  expect(toSnapshotSync({ fs })).toMatchSnapshot()
  expect(handlers.httpIcons.mock).toHaveBeenCalledOnce()
})

test('works with https', async () => {
  await fetchPipe(handlers.httpsIcons.path)
  expect(toSnapshotSync({ fs })).toMatchSnapshot()
  expect(handlers.httpsIcons.mock).toHaveBeenCalledOnce()
})

test('fails with network error', async () => {
  await expect(
    fetchPipe(handlers.httpNetworkError.path),
  ).rejects.toThrowErrorMatchingSnapshot()
  expect(toSnapshotSync({ fs })).toMatchSnapshot()
  expect(handlers.httpNetworkError.mock).toHaveBeenCalledOnce()
})

test('fails with bad request', async () => {
  await expect(
    fetchPipe(handlers.httpBadRequest.path),
  ).rejects.toThrowErrorMatchingSnapshot()
  expect(toSnapshotSync({ fs })).toMatchSnapshot()
  expect(handlers.httpBadRequest.mock).toHaveBeenCalledOnce()
})
