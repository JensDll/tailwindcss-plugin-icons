import fs from 'node:fs/promises'
import path from 'node:path'

import { normalizePath } from 'vite'
import { describe, expect, test, vi } from 'vitest'

import { tempDirPath, tempDirSnapshot } from './tempDir.mjs'
import { icons } from '../src/plugin.mjs'

const consoleErrorMock = vi.spyOn(console, 'error')

/**
 * @param {string} configName
 */
function initTempDir(configName) {
  /** @type {import('../src/lib.mjs').IconsConfig} */
  const config = {
    iconSets: [
      {
        name: 'local',
        location: 'local.json',
      },
    ],
  }

  const local = {
    icons: {
      foo: {
        body: 'foo',
      },
      bar: {
        body: 'bar',
        left: 2,
        height: 7,
      },
    },
    width: 10,
  }

  return Promise.all([
    fs.writeFile(tempDirPath + path.sep + configName, JSON.stringify(config)),
    fs.writeFile(tempDirPath + path.sep + 'local.json', JSON.stringify(local)),
  ])
}

describe('default config path', () => {
  test('build start', async () => {
    await initTempDir('icons.json')

    const plugin = icons()
    const root = normalizePath(tempDirPath)

    // @ts-expect-error
    await plugin.configResolved({ root })
    // @ts-expect-error
    await plugin.buildStart()

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })

  test('handle hot update', async () => {
    await initTempDir('icons.json')

    const plugin = icons()
    const root = normalizePath(tempDirPath)
    const file = root + '/icons.json'

    // @ts-expect-error
    await plugin.configResolved({ root })
    // @ts-expect-error
    await plugin.handleHotUpdate({ file, read: () => fs.readFile(file) })

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })
})

describe('defined config path', () => {
  test('build start', async () => {
    await initTempDir('config.json')

    const plugin = icons({ config: 'config.json' })
    const root = normalizePath(tempDirPath)

    // @ts-expect-error
    await plugin.configResolved({ root })
    // @ts-expect-error
    await plugin.buildStart()

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })

  test('handle hot update', async () => {
    await initTempDir('config.json')

    const plugin = icons({ config: 'config.json' })
    const root = normalizePath(tempDirPath)
    const file = root + '/config.json'

    // @ts-expect-error
    await plugin.configResolved({ root })
    // @ts-expect-error
    await plugin.handleHotUpdate({ file, read: () => fs.readFile(file) })

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })
})

test('build start - logs error when config not found', async () => {
  await initTempDir('not-found')

  const plugin = icons()
  const root = normalizePath(tempDirPath)

  // @ts-expect-error
  await plugin.configResolved({ root })
  // @ts-expect-error
  await plugin.buildStart()

  expect(consoleErrorMock.mock.calls).toStrictEqual([
    [
      expect.stringMatching(
        /\[tailwindcss-plugin-icons\] Failed to find config at ".+"/,
      ),
    ],
  ])
})
