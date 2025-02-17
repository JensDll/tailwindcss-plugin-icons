import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { test, expect, vi } from 'vitest'

import { handlers, iconSet } from './server.mjs'
import { tempDirPath } from './tempDir.mjs'
import { _loadIconData, uriToFilename } from '../src/lib.mjs'

vi.mock('@iconify-json/foo/icons.json', () => ({
  default: {
    icons: { a: { body: '' } },
  },
}))

vi.mock('@iconify/json/json/bar.json', () => ({
  default: {
    icons: { a: { body: '' } },
    aliases: { b: { parent: 'a', width: 16, height: 16, rotate: 1 } },
    width: 24,
    height: 24,
  },
}))

vi.mock('icons-module', () => ({
  default: {
    icon: {
      x: { body: 'x' },
      y: { body: 'y' },
    },
    left: 10,
    top: 11,
  },
}))

test('without location loads from @iconify-json by name', async () => {
  expect(await _loadIconData({ name: 'foo' }, '')).toMatchSnapshot()
})

test('without location loads from @iconify/json by name', async () => {
  expect(await _loadIconData({ name: 'bar' }, '')).toMatchSnapshot()
})

test('fails to load without location with invalid name', async () => {
  await expect(
    _loadIconData({ name: 'invalid' }, ''),
  ).rejects.toThrowErrorMatchingSnapshot()
})

test('loads from http location and caches result to file system', async () => {
  const { path: location, mock } = handlers.httpIcons
  const iconSetPath = new URL(uriToFilename(location), import.meta.url)

  vi.doMock(fileURLToPath(iconSetPath), async () => {
    const data = await fs.readFile(iconSetPath)
    return {
      default: JSON.parse(data.toString()),
    }
  })

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
  const iconSetPath = new URL(uriToFilename(location), import.meta.url)

  vi.doMock(fileURLToPath(iconSetPath), async () => {
    const data = await fs.readFile(iconSetPath)
    return {
      default: JSON.parse(data.toString()),
    }
  })

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()

  await expect(
    _loadIconData({ name: 'irrelevant', location }, ''),
  ).resolves.toMatchSnapshot()
  expect(mock).toHaveBeenCalledOnce()
})

test('loads from module by location', async () => {
  expect(
    await _loadIconData({ name: 'xyz', location: 'icons-module' }, ''),
  ).toMatchSnapshot()
})

test('loads from module by location (rename default location)', async () => {
  expect(
    await _loadIconData(
      { name: 'rename', location: '@iconify-json/foo/icons.json' },
      '',
    ),
  ).toMatchSnapshot()
})

test('loads from local path', async () => {
  await fs.writeFile(
    new URL('local.json', import.meta.url),
    JSON.stringify(iconSet),
  )
  expect(
    await _loadIconData(
      { name: 'abc', location: './local.json', icons: ['abc'] },
      tempDirPath,
    ),
  ).toMatchSnapshot()
})

test('fails to load from local path', async () => {
  await expect(
    _loadIconData({ name: '', location: './local.json' }, tempDirPath),
  ).rejects.toThrowErrorMatchingSnapshot()
})
