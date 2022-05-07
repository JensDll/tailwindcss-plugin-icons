import { loadIconFromJson, toKebabCase, isUri } from '../src/index'

describe('toKebabCase', () => {
  it.each([
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
  it.each([
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

describe('loadIconFromJson', () => {
  const iconifyJson = {
    icons: {
      'with-current-color': {
        // Should be rendered as mask (mode = mask)
        body: 'currentColor'
      },
      'with-current-color?bg': {
        // Force as background (mode = bg)
        body: 'currentColor'
      },
      'with-color': {
        // Should be rendered as background (mode = color)
        body: '#fff'
      },
      'with-color?mask': {
        // Force as mask (mode = mask)
        body: '#fff'
      },
      'with-width': {
        body: '',
        width: 20
      },
      'with-height': {
        body: '',
        height: 20
      },
      'with-width-and-height': {
        body: '',
        width: 20,
        height: 20
      }
    },
    width: 24,
    height: 24
  } as const

  type IconifyJson = typeof iconifyJson

  it.each<{
    iconName: keyof IconifyJson['icons']
    expected: ReturnType<typeof loadIconFromJson>
  }>([
    {
      iconName: 'with-current-color',
      expected: {
        width: 24,
        height: 24,
        mode: 'mask',
        body: 'currentColor',
        normalizedIconName: 'with-current-color'
      }
    },
    {
      iconName: 'with-current-color?bg',
      expected: {
        width: 24,
        height: 24,
        mode: 'bg',
        body: 'currentColor',
        normalizedIconName: 'with-current-color'
      }
    },
    {
      iconName: 'with-color',
      expected: {
        width: 24,
        height: 24,
        mode: 'color',
        body: '#fff',
        normalizedIconName: 'with-color'
      }
    },
    {
      iconName: 'with-color?mask',
      expected: {
        width: 24,
        height: 24,
        mode: 'mask',
        body: '#fff',
        normalizedIconName: 'with-color'
      }
    },
    {
      iconName: 'with-width',
      expected: {
        width: 20,
        height: 24,
        mode: 'color',
        body: '',
        normalizedIconName: 'with-width'
      }
    },
    {
      iconName: 'with-height',
      expected: {
        width: 24,
        height: 20,
        mode: 'color',
        body: '',
        normalizedIconName: 'with-height'
      }
    },
    {
      iconName: 'with-width-and-height',
      expected: {
        width: 20,
        height: 20,
        mode: 'color',
        body: '',
        normalizedIconName: 'with-width-and-height'
      }
    }
  ])('$iconName', ({ iconName, expected }) => {
    const actual = loadIconFromJson(iconifyJson, iconName)
    expect(actual).toStrictEqual(expected)
  })
})
