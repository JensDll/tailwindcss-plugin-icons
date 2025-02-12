import { fs, vol } from 'memfs'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  describe,
  expect,
  test,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest'

import { uriToFilename } from './common.mjs'
import { resolveIconData } from './resolve.mjs'

vi.mock('@iconify-json/foo/icons.json', () => {
  return {
    default: {
      info: { name: 'foo' },
      icons: { icon: { body: '' } },
    },
  }
})

vi.mock('@iconify/json/json/bar.json', () => {
  return {
    default: {
      info: { name: 'bar' },
      icons: { icon: { body: '' } },
    },
  }
})

vi.mock('icon-module', () => {
  return {
    default: {
      info: { name: 'icon-module' },
      icons: { icon: { body: '' } },
    },
  }
})

vi.mock('node:fs')
vi.mock('node:fs/promises')

beforeEach(() => {
  vol.reset()
})

test('resolves from @iconify-json', async () => {
  const result = await resolveIconData('')(['foo', {}])
  expect(result).toMatchSnapshot()
})

test('resolves from @iconify/json', async () => {
  const result = await resolveIconData('')(['bar', {}])
  expect(result).toMatchSnapshot()
})

test('fails to resolve from default locations', async () => {
  await expect(
    resolveIconData('')(['invalid', {}]),
  ).rejects.toThrowErrorMatchingSnapshot()
})

describe('http location', () => {
  const httpResolver = vi.fn(() =>
    HttpResponse.json({
      info: { name: 'http' },
      icons: { icon: { body: '' } },
      width: 24,
      height: 24,
    }),
  )

  const httpsResolver = vi.fn(() =>
    HttpResponse.json({
      info: { name: 'https' },
      icons: { icon: { body: '' } },
      width: 32,
      height: 32,
    }),
  )

  const server = setupServer(
    http.get('http://localhost/icons.json', httpResolver),
    http.get('https://localhost/icons.json', httpsResolver),
  )

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  beforeEach(() => {
    httpResolver.mockClear()
    httpsResolver.mockClear()
  })

  afterAll(() => {
    server.close()
  })

  test('fetches http and caches result', async () => {
    const location = 'http://localhost/icons.json'

    const path = new URL(uriToFilename(location), import.meta.url)

    vi.doMock(path.toString(), () => ({
      default: JSON.parse(fs.readFileSync(path).toString()),
    }))

    await expect(
      resolveIconData('')(['', { location }]),
    ).resolves.toMatchSnapshot()
    expect(httpResolver).toHaveBeenCalledOnce()

    await expect(
      resolveIconData('')(['', { location }]),
    ).resolves.toMatchSnapshot()
    expect(httpResolver).toHaveBeenCalledOnce()
  })

  test('fetches https and caches result', async () => {
    const location = 'https://localhost/icons.json'

    const path = new URL(uriToFilename(location), import.meta.url)

    vi.doMock(path.toString(), () => ({
      default: JSON.parse(fs.readFileSync(path).toString()),
    }))

    await expect(
      resolveIconData('')(['', { location }]),
    ).resolves.toMatchSnapshot()
    expect(httpsResolver).toHaveBeenCalledOnce()

    await expect(
      resolveIconData('')(['', { location }]),
    ).resolves.toMatchSnapshot()
    expect(httpsResolver).toHaveBeenCalledOnce()
  })
})

test('resolves from non-default module', async () => {
  const result = await resolveIconData('')(['', { location: 'icon-module' }])
  expect(result).toMatchSnapshot()
})

test('resolves from local path', async () => {
  vol.fromJSON({
    'icons.json': JSON.stringify({
      info: { name: 'local' },
      icons: { icon: { body: '' } },
    }),
  })
  const result = await resolveIconData('')(['', { location: './icons.json' }])
  expect(result).toMatchSnapshot()
})

test('resolves from local path with root', async () => {
  vol.fromJSON(
    {
      'icons.json': JSON.stringify({ info: { name: 'local with root' } }),
    },
    '/sub',
  )
  const result = await resolveIconData('/sub')([
    '',
    { location: './icons.json' },
  ])
  expect(result).toMatchSnapshot()
})

test('fails to resolve from local path', async () => {
  await expect(
    resolveIconData('')(['', { location: './icons.json' }]),
  ).rejects.toThrowErrorMatchingSnapshot()
})
