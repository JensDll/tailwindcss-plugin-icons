import type { IconifyJSON } from '@iconify/types'

import {
  loadIconFromJson,
  toKebabCase,
  isUri,
  uriToFilename
} from '../src/index'

describe('toKebabCase', () => {
  test.each([
    {
      value: 'heroiconsSolid',
      expected: 'heroicons-solid'
    },
    {
      value: 'HeroiconsSolid',
      expected: 'heroicons-solid'
    },
    {
      value: 'heroicons-Solid',
      expected: 'heroicons-solid'
    }
  ])('$value', ({ value, expected }) => {
    const actual = toKebabCase(value)
    expect(actual).toBe(expected)
  })
})

describe('isUri', () => {
  test.each([
    {
      value: 'https://example.com',
      expected: true
    },
    {
      value: 'http://example.com',
      expected: true
    },
    {
      value: './src/icons.json',
      expected: false
    },
    {
      value: 'src/icons.json',
      expected: false
    }
  ])('$value', ({ value, expected }) => {
    const actual = isUri(value)
    expect(actual).toBe(expected)
  })
})

describe('uriToFilename', () => {
  test.each([
    {
      value: 'https://example.com',
      expected: 'example.com'
    },
    {
      value: 'http://example.com/foo/icons.json',
      expected: 'example.comfooicons.json'
    },
    {
      value: 'example.com/foo/icons.json',
      expected: 'example.comfooicons.json'
    }
  ])('$value', ({ value, expected }) => {
    const actual = uriToFilename(value)
    expect(actual).toBe(expected)
  })
})

describe('loadIconFromJson', () => {
  const iconifyJson = {
    icons: {
      'current-color': {
        body: 'currentColor'
      },
      'current-color?bg': {
        body: 'currentColor'
      },
      color: {
        body: '#fff'
      },
      'color?mask': {
        body: '#fff'
      },
      left: {
        body: '',
        left: 10
      },
      top: {
        body: '',
        top: 20
      },
      width: {
        body: '',
        width: 30
      },
      height: {
        body: '',
        height: 40
      },
      'left+top': {
        body: '',
        left: 10,
        top: 20
      },
      'left+top+width': {
        body: '',
        left: 10,
        top: 20,
        width: 30
      },
      'left+top+width+height': {
        body: '',
        left: 10,
        top: 20,
        width: 30,
        height: 40
      }
    },
    prefix: 'test',
    left: 1,
    top: 2,
    width: 3,
    height: 4
  } as const

  type IconifyJson = typeof iconifyJson

  test.each<{
    iconName: keyof IconifyJson['icons']
    expected: ReturnType<typeof loadIconFromJson>
  }>([
    {
      iconName: 'current-color',
      expected: {
        name: 'current-color',
        body: 'currentColor',
        mode: 'mask',
        left: 1,
        top: 2,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'current-color?bg',
      expected: {
        name: 'current-color',
        body: 'currentColor',
        mode: 'bg',
        left: 1,
        top: 2,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'color',
      expected: {
        name: 'color',
        body: '#fff',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'color?mask',
      expected: {
        name: 'color',
        body: '#fff',
        mode: 'mask',
        left: 1,
        top: 2,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'left',
      expected: {
        name: 'left',
        body: '',
        mode: 'color',
        left: 10,
        top: 2,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'top',
      expected: {
        name: 'top',
        body: '',
        mode: 'color',
        left: 1,
        top: 20,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'width',
      expected: {
        name: 'width',
        body: '',
        mode: 'color',
        left: 1,
        top: 2,
        width: 30,
        height: 4
      }
    },
    {
      iconName: 'height',
      expected: {
        name: 'height',
        body: '',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 40
      }
    },
    {
      iconName: 'left+top',
      expected: {
        name: 'left+top',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 3,
        height: 4
      }
    },
    {
      iconName: 'left+top+width',
      expected: {
        name: 'left+top+width',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 30,
        height: 4
      }
    },
    {
      iconName: 'left+top+width+height',
      expected: {
        name: 'left+top+width+height',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 30,
        height: 40
      }
    }
  ])('$iconName', ({ iconName, expected }) => {
    const actual = loadIconFromJson(iconifyJson, iconName)
    expect(actual).toStrictEqual(expected)
  })
})
