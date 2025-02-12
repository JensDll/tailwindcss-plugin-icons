import { fs, vol } from 'memfs'
import { toSnapshotSync } from 'memfs/lib/snapshot'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { beforeAll, afterAll, beforeEach, vi, test, expect } from 'vitest'

import { fetchPipe } from './fetch.mjs'

vi.mock('node:fs')
vi.mock('node:fs/promises')

const iconSet = {
  prefix: '🔥',
  info: { name: '💯' },
  icons: { icon: { body: '' } },
  width: 24,
  height: 24,
}

const server = setupServer(
  http.get('http://localhost/icons.json', () => HttpResponse.json(iconSet)),
  http.get('https://localhost/icons.json', () => HttpResponse.json(iconSet)),
  http.get('https://localhost/error', () => HttpResponse.error()),
  http.get(
    'https://localhost/bad',
    () => new HttpResponse('Not Found', { status: 404 }),
  ),
)

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
  await fetchPipe('http://localhost/icons.json')
  expect(toSnapshotSync({ fs, path: '/' })).toMatchSnapshot()
})

test('works with https', async () => {
  await fetchPipe('https://localhost/icons.json')
  expect(toSnapshotSync({ fs, path: '/' })).toMatchSnapshot()
})

test('fails with network error', async () => {
  await expect(
    fetchPipe('https://localhost/error'),
  ).rejects.toThrowErrorMatchingSnapshot()
  expect(toSnapshotSync({ fs, path: '/' })).toMatchSnapshot()
})

test('fails with bad request', async () => {
  await expect(
    fetchPipe('https://localhost/bad'),
  ).rejects.toThrowErrorMatchingSnapshot()
  expect(toSnapshotSync({ fs, path: '/' })).toMatchSnapshot()
})
