import { expect, test, afterEach, vi } from 'vitest'

import { transform } from '../src/lib.mjs'

const consoleErrorMock = vi.spyOn(console, 'error')

/** @typedef {AsyncGenerator<import('../src/lib.mjs').IconData, void, unknown>} IconDataGenerator */

/** @type {Record<string, import('../src/lib.mjs').IconDataIcon>} */
const icons = {
  a: { body: '1' },
  b: { body: '2', left: 10 },
  c: { body: '3', top: 10 },
  d: { body: '4', width: 10 },
  e: { body: '5', height: 10 },
  f: { body: '6', width: 5, height: 6 },
}

/** @type {Record<string, import('../src/lib.mjs').IconDataAlias>} */
const aliases = {
  g: { parent: 'a' },
  h: { parent: 'b', left: 20 },
  i: { parent: 'c', top: 20 },
  j: { parent: 'd', width: 20 },
  k: { parent: 'e', height: 20 },
  l: { parent: 'a', width: 5, height: 6 },
  m: { parent: 'a' },
}

/** @type {() => IconDataGenerator} */
let source

afterEach(async () => {
  const result = []

  for await (const value of transform(source())) {
    result.push(value)
  }

  expect(result).toMatchSnapshot()
})

const names = ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'i', 'j', 'k']

test('default dimensions', () => {
  source = async function* () {
    yield {
      name: 'icons',
      icons,
    }
    yield {
      name: 'icons-aliases',
      icons,
      aliases,
    }
    yield {
      name: 'names-icons',
      names,
      icons,
    }
    yield {
      name: 'names-icons-aliases',
      names,
      icons,
      aliases,
    }
  }
})

test('default left', () => {
  source = async function* () {
    yield {
      name: 'icons',
      icons,
      left: 3,
    }
    yield {
      name: 'icons-aliases',
      icons,
      aliases,
      left: 3,
    }
    yield {
      name: 'names-icons',
      names,
      icons,
      left: 3,
    }
    yield {
      name: 'names-icons-aliases',
      names,
      icons,
      aliases,
      left: 3,
    }
  }
})

test('default top', () => {
  source = async function* () {
    yield {
      name: 'icons',
      icons,
      top: 3,
    }
    yield {
      name: 'icons-aliases',
      icons,
      aliases,
      top: 3,
    }
    yield {
      name: 'names-icons',
      names,
      icons,
      top: 3,
    }
    yield {
      name: 'names-icons-aliases',
      names,
      icons,
      aliases,
      top: 3,
    }
  }
})

test('default width', () => {
  source = async function* () {
    yield {
      name: 'icons',
      icons,
      width: 3,
    }
    yield {
      name: 'icons-aliases',
      icons,
      aliases,
      width: 3,
    }
    yield {
      name: 'names-icons',
      names,
      icons,
      width: 3,
    }
    yield {
      name: 'names-icons-aliases',
      names,
      icons,
      aliases,
      width: 3,
    }
  }
})

test('default height', () => {
  source = async function* () {
    yield {
      name: 'icons',
      icons,
      height: 3,
    }
    yield {
      name: 'icons-aliases',
      icons,
      aliases,
      height: 3,
    }
    yield {
      name: 'names-icons',
      names,
      icons,
      height: 3,
    }
    yield {
      name: 'names-icons-aliases',
      names,
      icons,
      aliases,
      height: 3,
    }
  }
})

test('logs error when icon name not found', async () => {
  source = async function* () {
    yield {
      name: 'foo',
      names: ['a', 'invalid', 'x', 'wrong'],
      icons,
    }
  }

  for await (const _ of transform(source())) {
  }

  expect(consoleErrorMock.mock.calls).toMatchSnapshot()
})
