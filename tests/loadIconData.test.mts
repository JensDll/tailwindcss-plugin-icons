import { fs, vol } from 'memfs'
import { test, expect, vi, afterAll, beforeAll, beforeEach } from 'vitest'
import { _loadIconData, uriToFilename } from '~/src/lib.mjs'

import { server, handlers, iconSet } from './server.mjs'

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

vi.mock('@iconify-json/foo/icons.json', () => ({
  default: {
    info: { name: 'foo' },
    icons: { a: { body: '' } },
  },
}))

vi.mock('@iconify/json/json/bar.json', () => ({
  default: {
    info: { name: 'bar' },
    icons: { a: { body: '' } },
    aliases: { b: { parent: 'a', width: 16, height: 16, rotate: 1 } },
    width: 24,
    height: 24,
  },
}))

test('without location loads from @iconify-json by name', async () => {
  const actual = await _loadIconData({ name: 'foo' }, '')
  expect(actual).toMatchSnapshot()
})

test('without location loads from @iconify/json by name', async () => {
  const actual = await _loadIconData({ name: 'bar' }, '')
  expect(actual).toMatchSnapshot()
})

test('fails to load without location with invalid name', async () => {
  await expect(
    _loadIconData({ name: 'invalid' }, ''),
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('loads from http location and caches result to file system', async () => {
  const { path: location, mock } = handlers.httpIcons
  const path = new URL(uriToFilename(location), import.meta.url)

  vi.doMock(path.toString(), () => ({
    default: JSON.parse(fs.readFileSync(path).toString()),
  }))

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()
})

test('loads from https location and caches result to file system', async () => {
  const { path: location, mock } = handlers.httpsIcons
  const path = new URL(uriToFilename(location), import.meta.url)

  vi.doMock(path.toString(), () => ({
    default: JSON.parse(fs.readFileSync(path).toString()),
  }))

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()
})

vi.mock('test-icons', () => ({ default: { info: { name: 'test-icons' } } }))

test('loads from module by location', async () => {
  const actual = await _loadIconData(
    { name: 'test-icons', location: 'test-icons' },
    '',
  )
  expect(actual).toMatchSnapshot()
})

test('loads from module by location (rename default location)', async () => {
  const actual = await _loadIconData(
    { name: 'rename', location: '@iconify-json/foo/icons.json' },
    '',
  )
  expect(actual).toMatchSnapshot()
})

test('loads from local path', async () => {
  vol.fromJSON({ 'local.json': JSON.stringify(iconSet) })
  const actual = await _loadIconData(
    { name: 'name', location: 'local.json', icons: ['abc'] },
    '',
  )
  expect(actual).toMatchSnapshot()
})

test('loads from local path (subdirectory)', async () => {
  vol.fromJSON({ 'local.json': JSON.stringify(iconSet) }, '/src')
  const actual = await _loadIconData(
    { name: 'name', location: 'local.json', icons: ['xyz'] },
    '/src',
  )
  expect(actual).toMatchSnapshot()
})

test('fails to load from local path', async () => {
  await expect(
    _loadIconData({ name: 'name', location: './local.json' }, ''),
  ).rejects.toThrowErrorMatchingSnapshot()
})
