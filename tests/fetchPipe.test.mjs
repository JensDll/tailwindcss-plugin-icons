import fs from 'node:fs/promises'

import { test, expect, vi } from 'vitest'

import { handlers } from './server.mjs'
import { tempDirSnapshot } from './tempDir.mjs'
import { fetchPipe } from '../src/lib.mjs'

test('works with http', async () => {
  await fetchPipe(handlers.httpIcons.path)
  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(handlers.httpIcons.mock).toHaveBeenCalledOnce()
})

test('works with https', async () => {
  await fetchPipe(handlers.httpsIcons.path)
  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(handlers.httpsIcons.mock).toHaveBeenCalledOnce()
})

test('fails with network error', async () => {
  await expect(
    fetchPipe(handlers.httpNetworkError.path),
  ).rejects.toThrowErrorMatchingSnapshot()
  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(handlers.httpNetworkError.mock).toHaveBeenCalledOnce()
})

test('fails with bad request', async () => {
  await expect(
    fetchPipe(handlers.httpBadRequest.path),
  ).rejects.toThrowErrorMatchingSnapshot()
  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(handlers.httpBadRequest.mock).toHaveBeenCalledOnce()
})

test('fs open fails', async () => {
  const fsOpen = vi
    .spyOn(fs, 'open')
    .mockRejectedValue(new Error('open failed'))
  const fsUnlink = vi.spyOn(fs, 'unlink')
  await expect(
    fetchPipe(handlers.httpBadRequest.path),
  ).rejects.toThrowErrorMatchingSnapshot()
  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(handlers.httpBadRequest.mock).toBeCalledTimes(0)
  expect(fsOpen).toHaveBeenCalledOnce()
  expect(fsUnlink).toHaveBeenCalledOnce()
})
