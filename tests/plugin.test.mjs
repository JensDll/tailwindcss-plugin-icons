import fs from 'node:fs/promises'
import path from 'node:path'

import { describe, expect, test, vi } from 'vitest'

import { tempDirPath, tempDirSnapshot } from './tempDir.mjs'
import { icons } from '../src/plugin.mjs'

const consoleErrorMock = vi.spyOn(console, 'error')

/**
 * @param {string} configPath
 */
function initTempDir(configPath) {
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
    fs.writeFile(tempDirPath + path.sep + configPath, JSON.stringify(config)),
    fs.writeFile(tempDirPath + path.sep + 'local.json', JSON.stringify(local)),
  ])
}

describe('default config path', () => {
  test('build start', async () => {
    await initTempDir('icons.json')

    const plugin = icons()

    // @ts-ignore
    await plugin.configResolved({ root: tempDirPath })
    // @ts-ignore
    await plugin.buildStart()

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })

  test('handle hot update', async () => {
    await initTempDir('icons.json')

    const plugin = icons()
    const file = tempDirPath + path.sep + 'icons.json'

    // @ts-ignore
    await plugin.configResolved({ root: tempDirPath })
    // @ts-ignore
    await plugin.handleHotUpdate({ file, read: () => fs.readFile(file) })

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })
})

describe('defined config path', () => {
  test('build start', async () => {
    await initTempDir('config.json')

    const plugin = icons({ config: 'config.json' })

    // @ts-ignore
    await plugin.configResolved({ root: tempDirPath })
    // @ts-ignore
    await plugin.buildStart()

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })

  test('handle hot update', async () => {
    await initTempDir('config.json')

    const plugin = icons({ config: 'config.json' })
    const file = tempDirPath + path.sep + 'config.json'

    // @ts-ignore
    await plugin.configResolved({ root: tempDirPath })
    // @ts-ignore
    await plugin.handleHotUpdate({ file, read: () => fs.readFile(file) })

    await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  })
})

test('build start - logs error when config not found', async () => {
  await initTempDir('not-found')
  const plugin = icons()

  // @ts-ignore
  await plugin.configResolved({ root: tempDirPath })
  // @ts-ignore
  await plugin.buildStart()

  expect(consoleErrorMock.mock.calls).toStrictEqual([
    [
      expect.stringMatching(
        /\[tailwindcss-plugin-icons\] Failed to find config at ".+"/,
      ),
    ],
  ])
})
