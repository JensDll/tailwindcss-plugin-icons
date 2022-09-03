import path from 'node:path'

import type { CSSRuleObject } from 'tailwindcss/types/config'

import type { ColorFunction } from '~tailwindcss-plugin-icons/css'
import { Icons, SCALE } from '~tailwindcss-plugin-icons/index'

vi.mock('~tailwindcss-plugin-icons/cache', () => {
  return {
    IconifyFileCache: class {}
  }
})

const mockPLuginAPI = {
  addUtilities: vi.fn(),
  matchUtilities: vi.fn(),
  addComponents: vi.fn(),
  matchComponents: vi.fn(),
  addBase: vi.fn(),
  addVariant: vi.fn(),
  theme: vi.fn(),
  config: vi.fn(),
  corePlugins: vi.fn(),
  e: vi.fn()
}

const location = path.resolve(__dirname, '__fixtures__/iconify.json')

test("fail if icon doesn't exist", () => {
  expect(() =>
    Icons(() => {
      return {
        test: {
          icons: {
            doesNotExist: {}
          },
          location
        }
      }
    }).handler(mockPLuginAPI)
  ).toThrowError()
})

test('use `addComponent` when not forced otherwise', () => {
  Icons(() => {
    return {
      testIcons: {
        icons: {
          colored: {},
          colorless: {}
        },
        location
      }
    }
  }).handler(mockPLuginAPI)

  expect(mockPLuginAPI.addComponents).toBeCalledTimes(1)
  expect(mockPLuginAPI.matchComponents).toBeCalledTimes(1)
  expect(mockPLuginAPI.addComponents.mock.calls[0][0]).toMatchSnapshot()
  expect(mockPLuginAPI.matchComponents).toBeCalledWith({}, expect.any(Object))
})

test('use `matchComponents` with the `?bg` query parameter', () => {
  Icons(() => {
    return {
      testIcons: {
        icons: {
          'colored?bg': {},
          'colorless?bg': {}
        },
        location
      }
    }
  }).handler(mockPLuginAPI)

  expect(mockPLuginAPI.addComponents).toBeCalledTimes(1)
  expect(mockPLuginAPI.matchComponents).toBeCalledTimes(1)
  expect(mockPLuginAPI.addComponents).toBeCalledWith({})
  expect(mockPLuginAPI.matchComponents.mock.calls[0][0]).toStrictEqual({
    'bg-test-icons-colored': expect.any(Function),
    'bg-test-icons-colorless': expect.any(Function)
  })

  const snapshot: Record<string, CSSRuleObject> = {}

  for (const [key, f] of Object.entries<ColorFunction>(
    mockPLuginAPI.matchComponents.mock.calls[0][0]
  )) {
    snapshot[key] = f('red')
  }

  expect(snapshot).toMatchSnapshot()
})

describe('scale width and height', () => {
  test('when passed per icon set', () => {
    Icons(() => {
      return {
        testIcons: {
          icons: {
            colored: {},
            colorless: {}
          },
          scale: 1.5,
          location
        }
      }
    }).handler(mockPLuginAPI)

    expect(mockPLuginAPI.addComponents.mock.calls[0][0]).toMatchSnapshot()
    expect(mockPLuginAPI.matchComponents).toBeCalledWith({}, expect.any(Object))
  })

  test('when passed per icon', () => {
    Icons(() => {
      return {
        testIcons: {
          icons: {
            colored: {
              [SCALE]: 2
            },
            colorless: {
              [SCALE]: 3
            }
          },
          scale: 1,
          location
        }
      }
    }).handler(mockPLuginAPI)

    expect(mockPLuginAPI.addComponents.mock.calls[0][0]).toMatchSnapshot()
    expect(mockPLuginAPI.matchComponents).toBeCalledWith({}, expect.any(Object))
  })
})
