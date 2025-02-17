import { expect, test, vi } from 'vitest'

import { tempDirSnapshot } from './tempDir.mjs'
import { transformConfig } from '../src/lib.mjs'

const consoleErrorMock = vi.spyOn(console, 'error')

vi.mock('@iconify-json/tar-valon/icons.json', () => ({
  default: {
    icons: {
      a: {
        body: '<path></path>',
      },
      b: {
        body: '<path></path>',
      },
    },
  },
}))

vi.mock('@iconify/json/json/ebou-dar.json', () => ({
  default: {
    icons: {
      a: {
        body: '<path></path>',
      },
      b: {
        body: '<path></path>',
      },
      c: {
        body: '<path></path>',
        width: 1,
        height: 2,
      },
    },
    width: 24,
    height: 24,
  },
}))

test('working example', async () => {
  /** @type {import('../src/lib.mjs').IconsConfig} */
  const config = {
    iconSets: [
      {
        name: 'tar-valon',
        icons: ['a'],
      },
      {
        name: 'ebou-dar',
      },
    ],
  }

  await transformConfig(config, '')

  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(consoleErrorMock).toHaveBeenCalledTimes(0)
})

test('invalid without location', async () => {
  /** @type {import('../src/lib.mjs').IconsConfig} */
  const config = {
    iconSets: [
      {
        name: 'invalid',
      },
    ],
  }

  await transformConfig(config, '')

  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(consoleErrorMock.mock.calls).toMatchSnapshot()
})

test('invalid with location', async () => {
  /** @type {import('../src/lib.mjs').IconsConfig} */
  const config = {
    iconSets: [
      {
        name: 'whatever',
        location: 'invalid',
      },
    ],
  }

  await transformConfig(config, '')

  await expect(tempDirSnapshot()).resolves.toMatchSnapshot()
  expect(consoleErrorMock.mock.calls).toMatchSnapshot()
})
