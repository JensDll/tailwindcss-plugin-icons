import { loadIcon, toKebabCase } from '../src/utils'

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

describe('loadIcon', () => {
  const iconifyJson = {
    icons: {
      'with-current-color': {
        body: 'currentColor'
      },
      'with-current-color?bg': {
        body: 'currentColor'
      },
      'without-current-color': {
        body: ''
      },
      'without-current-color?mask': {
        body: ''
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
    expected: ReturnType<typeof loadIcon>
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
      iconName: 'without-current-color',
      expected: {
        width: 24,
        height: 24,
        mode: 'bg',
        body: '',
        normalizedIconName: 'without-current-color'
      }
    },
    {
      iconName: 'without-current-color?mask',
      expected: {
        width: 24,
        height: 24,
        mode: 'mask',
        body: '',
        normalizedIconName: 'without-current-color'
      }
    },
    {
      iconName: 'with-width',
      expected: {
        width: 20,
        height: 24,
        mode: 'bg',
        body: '',
        normalizedIconName: 'with-width'
      }
    },
    {
      iconName: 'with-height',
      expected: {
        width: 24,
        height: 20,
        mode: 'bg',
        body: '',
        normalizedIconName: 'with-height'
      }
    },
    {
      iconName: 'with-width-and-height',
      expected: {
        width: 20,
        height: 20,
        mode: 'bg',
        body: '',
        normalizedIconName: 'with-width-and-height'
      }
    }
  ])('$iconName', ({ iconName, expected }) => {
    const actual = loadIcon(iconifyJson, iconName)
    expect(actual).toStrictEqual(expected)
  })
})
