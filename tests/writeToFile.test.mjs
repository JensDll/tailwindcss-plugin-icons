import { describe, test, expect } from 'vitest'

import { tempDirSnapshot } from './tempDir.mjs'
import { writeToFile } from '../src/lib.mjs'

/** @typedef {AsyncGenerator<import('../src/lib.mjs').TransformIconData, void, unknown>} TransformIconDataGenerator */

describe('write to file with prefix', () => {
  /**
   * @returns {TransformIconDataGenerator}
   */
  async function* generator() {
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
    expect(await tempDirSnapshot()).toMatchSnapshot()
  })

  test('mask', async () => {
    await writeToFile({
      mask: 'mask-icon-prefix',
    })(generator())
    expect(await tempDirSnapshot()).toMatchSnapshot()
  })

  test('mask and background', async () => {
    await writeToFile({
      mask: 'mask-icon-prefix',
      background: 'background-icon-prefix',
    })(generator())
    expect(await tempDirSnapshot()).toMatchSnapshot()
  })
})
