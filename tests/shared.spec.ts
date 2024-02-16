import { html } from '~/scripts/utils.mjs'
import {
  isUri,
  loadIconFromIconifyJson,
  parseIconName,
  toKebabCase,
  encodeSvg,
  type ParsedIconName,
} from '~/src/chunks/shared/index.ts'

describe('toKebabCase', () => {
  test.each([
    {
      value: 'heroiconsSolid',
      expected: 'heroicons-solid',
    },
    {
      value: 'HeroiconsSolid',
      expected: 'heroicons-solid',
    },
    {
      value: 'heroicons-Solid',
      expected: 'heroicons-solid',
    },
  ])('$value', ({ value, expected }) => {
    const actual = toKebabCase(value)
    expect(actual).toBe(expected)
  })
})

describe('isUri', () => {
  test.each([
    {
      value: 'https://example.com',
      expected: true,
    },
    {
      value: 'http://example.com',
      expected: true,
    },
    {
      value: 'http:/example.com',
      expected: false,
    },
    {
      value: './src/icons.json',
      expected: false,
    },
    {
      value: 'src/icons.json',
      expected: false,
    },
    {
      value: '',
      expected: false,
    },
    {
      value: undefined,
      expected: false,
    },
    {
      value: null,
      expected: false,
    },
  ])('$value', ({ value, expected }) => {
    const actual = isUri(value)
    expect(actual).toBe(expected)
  })
})

describe('encodeSvg', () => {
  test('matches url encoded', () => {
    const svg = html`<svg
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    ></svg>`
    const actual = encodeSvg(svg)
    expect(actual).toMatchSnapshot()
  })

  test('without namespace', () => {
    const svg = html`<svg viewBox="0 0 10 10"></svg>`
    const actual = encodeSvg(svg)
    expect(actual).toMatchSnapshot()
  })

  test('without namespace and empty', () => {
    const svg = html`<svg></svg>`
    const actual = encodeSvg(svg)
    expect(actual).toMatchSnapshot()
  })

  test('needs xlink namespace', () => {
    const svg = html`<svg><use xlink:href="test"></use></svg>`
    const actual = encodeSvg(svg)
    expect(actual).toMatchSnapshot()
  })
})

describe('parseIconName', () => {
  test.each<{
    value: string
    expected: ParsedIconName
  }>([
    {
      value: 'plusCircle',
      expected: {
        normalizedIconName: 'plus-circle',
        iconMode: undefined,
      },
    },
    {
      value: 'plusCircle?bg',
      expected: {
        normalizedIconName: 'plus-circle',
        iconMode: 'bg',
      },
    },
    {
      value: 'plusCircle?mask',
      expected: {
        normalizedIconName: 'plus-circle',
        iconMode: 'mask',
      },
    },
  ])('$value', ({ value, expected }) => {
    const actual = parseIconName(value)
    expect(actual).toStrictEqual(expected)
  })
})

describe('loadIconFromJson', () => {
  const iconifyJson = {
    icons: {
      'current-color': {
        body: 'currentColor',
      },
      color: {
        body: '#fff',
      },
      left: {
        body: '',
        left: 10,
      },
      top: {
        body: '',
        top: 20,
      },
      width: {
        body: '',
        width: 30,
      },
      height: {
        body: '',
        height: 40,
      },
      'left+top': {
        body: '',
        left: 10,
        top: 20,
      },
      'left+top+width': {
        body: '',
        left: 10,
        top: 20,
        width: 30,
      },
      'left+top+width+height': {
        body: '',
        left: 10,
        top: 20,
        width: 30,
        height: 40,
      },
      rotate90: {
        body: 'body',
        rotate: 1,
        left: 5,
        top: 10,
        width: 50,
        height: 100,
      },
      rotate180: {
        body: 'body',
        rotate: 2,
        left: 5,
        top: 10,
        width: 50,
        height: 100,
      },
      'h-flip': {
        body: 'body',
        hFlip: true,
      },
      'v-flip': {
        body: 'body',
        vFlip: true,
      },
    },
    aliases: {
      'current-color-rotate90': {
        parent: 'current-color',
        rotate: 1,
      },
    },
    prefix: 'test',
    left: 1,
    top: 2,
    width: 3,
    height: 4,
  } as const

  type IconifyJson = typeof iconifyJson

  test.each<{
    iconName: `${keyof IconifyJson['icons'] | keyof IconifyJson['aliases']}${
      | '?bg'
      | '?mask'
      | ''}`
    expected: ReturnType<typeof loadIconFromIconifyJson>
  }>([
    {
      iconName: 'current-color',
      expected: {
        normalizedName: 'current-color',
        body: 'currentColor',
        mode: 'mask',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'current-color-rotate90',
      expected: {
        normalizedName: 'current-color-rotate90',
        body: '<g transform="rotate(90 2.5 4)">currentColor</g>',
        mode: 'mask',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'current-color?bg',
      expected: {
        normalizedName: 'current-color',
        body: 'currentColor',
        mode: 'bg',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'color',
      expected: {
        normalizedName: 'color',
        body: '#fff',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'color?mask',
      expected: {
        normalizedName: 'color',
        body: '#fff',
        mode: 'mask',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'left',
      expected: {
        normalizedName: 'left',
        body: '',
        mode: 'color',
        left: 10,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'top',
      expected: {
        normalizedName: 'top',
        body: '',
        mode: 'color',
        left: 1,
        top: 20,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'width',
      expected: {
        normalizedName: 'width',
        body: '',
        mode: 'color',
        left: 1,
        top: 2,
        width: 30,
        height: 4,
      },
    },
    {
      iconName: 'height',
      expected: {
        normalizedName: 'height',
        body: '',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 40,
      },
    },
    {
      iconName: 'left+top',
      expected: {
        normalizedName: 'left+top',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'left+top+width',
      expected: {
        normalizedName: 'left+top+width',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 30,
        height: 4,
      },
    },
    {
      iconName: 'left+top+width+height',
      expected: {
        normalizedName: 'left+top+width+height',
        body: '',
        mode: 'color',
        left: 10,
        top: 20,
        width: 30,
        height: 40,
      },
    },
    {
      iconName: 'rotate90',
      expected: {
        normalizedName: 'rotate90',
        body: '<g transform="rotate(90 30 60)">body</g>',
        mode: 'color',
        left: 5,
        top: 10,
        width: 50,
        height: 100,
      },
    },
    {
      iconName: 'rotate180',
      expected: {
        normalizedName: 'rotate180',
        body: '<g transform="rotate(180 30 60)">body</g>',
        mode: 'color',
        left: 5,
        top: 10,
        width: 50,
        height: 100,
      },
    },
    {
      iconName: 'h-flip',
      expected: {
        normalizedName: 'h-flip',
        body: '<g transform="translate(5 0) scale(-1 1)">body</g>',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
    {
      iconName: 'v-flip',
      expected: {
        normalizedName: 'v-flip',
        body: '<g transform="translate(0 8) scale(1 -1)">body</g>',
        mode: 'color',
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      },
    },
  ])('$iconName', ({ iconName, expected }) => {
    const actual = loadIconFromIconifyJson(iconifyJson, iconName)
    expect(actual).toStrictEqual(expected)
  })
})
