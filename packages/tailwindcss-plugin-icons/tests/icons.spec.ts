import path from 'node:path'

import type { CSSRuleObject, PluginAPI } from 'tailwindcss/types/config'
import type { Mocked } from 'vitest'

import type { ColorFunction } from '~tailwindcss-plugin-icons/css'
import { Icons, SCALE } from '~tailwindcss-plugin-icons/index'

const consoleErrorMock = vi.spyOn(console, 'error')

vi.mock('~tailwindcss-plugin-icons/cache', () => {
  return {
    IconifyFileCache: class {}
  }
})

const mockPluginApi: Mocked<PluginAPI> = {
  addUtilities: vi.fn(),
  matchUtilities: vi.fn(),
  addComponents: vi.fn(),
  matchComponents: vi.fn(),
  addBase: vi.fn(),
  addVariant: vi.fn(),
  theme: vi.fn<[path?: string | undefined, defaultValue?: unknown], never>(),
  config: vi.fn<[path?: string | undefined, defaultValue?: unknown], never>(),
  corePlugins: vi.fn(),
  e: vi.fn()
}

const location = path.resolve(__dirname, '__fixtures__/icons.json')

afterEach(() => {
  expect(mockPluginApi.addComponents.mock.lastCall).toMatchSnapshot()
  expect(mockPluginApi.matchComponents.mock.lastCall).toMatchSnapshot()

  if (mockPluginApi.matchComponents.mock.lastCall !== undefined) {
    const snapshot: Record<string, CSSRuleObject> = {}

    for (const [key, colorFunction] of Object.entries<ColorFunction>(
      mockPluginApi.matchComponents.mock.lastCall![0]
    )) {
      snapshot[key] = colorFunction('red')
    }

    expect(snapshot).toMatchSnapshot()
  }
})

test("fail if icon doesn't exist", () => {
  Icons(() => {
    return {
      testIcons: {
        icons: {
          doesNotExist: {}
        },
        location
      }
    }
  }).handler(mockPluginApi)

  expect(mockPluginApi.addComponents).toBeCalledTimes(0)
  expect(mockPluginApi.matchComponents).toBeCalledTimes(0)
  expect(consoleErrorMock).toBeCalledTimes(1)
})

test('use addComponent when not forced otherwise', () => {
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
  }).handler(mockPluginApi)

  expect(mockPluginApi.addComponents).toBeCalledTimes(1)
  expect(mockPluginApi.matchComponents).toBeCalledTimes(1)
})

test('use matchComponents when forced as bg', () => {
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
  }).handler(mockPluginApi)

  expect(mockPluginApi.addComponents).toBeCalledTimes(1)
  expect(mockPluginApi.matchComponents).toBeCalledTimes(1)
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
    }).handler(mockPluginApi)

    expect(mockPluginApi.addComponents).toBeCalledTimes(1)
    expect(mockPluginApi.matchComponents).toBeCalledTimes(1)
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
    }).handler(mockPluginApi)

    expect(mockPluginApi.addComponents).toBeCalledTimes(1)
    expect(mockPluginApi.matchComponents).toBeCalledTimes(1)
  })
})

describe('include all', () => {
  afterEach(() => {
    expect(mockPluginApi.addComponents).toBeCalledTimes(1)
    expect(mockPluginApi.matchComponents).toBeCalledTimes(1)
  })

  test('without icons', () => {
    Icons(() => {
      return {
        testIcons: {
          includeAll: true,
          location
        }
      }
    }).handler(mockPluginApi)
  })

  test('with default CSS', () => {
    Icons(() => {
      return {
        testIcons: {
          icons: {
            colorless: {
              color: 'red'
            }
          },
          includeAll: true,
          location
        }
      }
    }).handler(mockPluginApi)
  })

  test('when forced as mask', () => {
    Icons(() => {
      return {
        testIcons: {
          icons: {
            'colored?mask': {
              color: 'red'
            }
          },
          includeAll: true,
          location
        }
      }
    }).handler(mockPluginApi)
  })

  test('when forced as bg', () => {
    Icons(() => {
      return {
        testIcons: {
          icons: {
            'colored?bg': {
              color: 'red'
            }
          },
          includeAll: true,
          location
        }
      }
    }).handler(mockPluginApi)
  })
})
