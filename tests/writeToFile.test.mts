import { fs, vol } from 'memfs'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { writeToFile, type TransformIconData } from '~/src/lib.mjs'

vi.mock('node:fs')
vi.mock('node:fs/promises')

type TransformIconDataGenerator = AsyncGenerator<
  TransformIconData,
  void,
  unknown
>

beforeEach(() => {
  vol.reset()
})

describe('write to file with prefix', () => {
  async function* generator(): TransformIconDataGenerator {
    yield {
      iconSetName: 'icon-set-one',
      icons: [
        {
          data: 'url()',
          name: 'icon-1',
          width: 16,
          height: 16,
        },
        {
          data: 'url()',
          name: 'icon-2',
          width: 16,
          height: 16,
        },
        {
          data: 'url()',
          name: 'icon-3',
          width: 16,
          height: 16,
        },
      ],
    }
    yield {
      iconSetName: 'icon-set-two',
      icons: [
        {
          data: 'url()',
          name: 'icon-1',
          width: 1,
          height: 2,
        },
        {
          data: 'url()',
          name: 'icon-2',
          width: 3,
          height: 4,
        },
      ],
    }
  }

  test('default', async () => {
    await writeToFile()(generator())
  })

  test('mask', async () => {
    await writeToFile({
      mask: 'mask-icon-prefix',
    })(generator())
  })

  test('mask and background', async () => {
    await writeToFile({
      mask: 'mask-icon-prefix',
      background: 'background-icon-prefix',
    })(generator())
  })

  afterEach(() => {
    expect(fs.readFileSync('/plugin.css').toString()).toMatchSnapshot()
  })
})
