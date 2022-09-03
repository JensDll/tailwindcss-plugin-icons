import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'

import fs from 'fs-extra'
import type { IconifyJSON } from '@iconify/types'

import { IconifyFileCache } from '~tailwindcss-plugin-icons/cache'

const readFixture = (fixture: string) =>
  [
    fixture,
    fs.readJSONSync(path.resolve(__dirname, '__fixtures__', fixture), 'ascii')
  ] as const

const readFixtures = (fixtures?: string[]) =>
  (fixtures === undefined ? ['cache1.json', 'cache2.json'] : fixtures).map(
    readFixture
  )

let cache: IconifyFileCache

beforeEach(() => {
  cache = new IconifyFileCache(path.resolve(os.tmpdir(), crypto.randomUUID()))
  cache.set(...readFixture('cache1.json')).set(...readFixture('cache2.json'))
  expect(cache.size).toBe(2)
})

afterEach(async () => {
  await fs.rm(cache.cacheDir, { recursive: true })
})

test('keys', () => {
  expect([...cache.keys()]).toStrictEqual(readFixtures().map(([k]) => k))
})

test('values', () => {
  expect([...cache.values()]).toStrictEqual(readFixtures().map(([, v]) => v))
})

test('entries', () => {
  expect([...cache.entries()]).toStrictEqual(readFixtures())
})

test('iterator', () => {
  expect([...cache]).toStrictEqual(readFixtures())
})

test('forEach', () => {
  const entries: [string, IconifyJSON][] = []

  cache.forEach(function (this: 42, value, key, map) {
    entries.push([key, value])
    expect(map).toBe(cache)
    expect(this).toBe(42)
  }, 42)

  expect(entries).toStrictEqual(readFixtures())
})

test('toString', () => {
  expect(cache.toString()).toBe(`[object IconifyFileCache(size=2)]`)
})

describe('get', () => {
  test.each([
    {
      key: 'cache1.json',
      expected: () => readFixture('cache1.json')[1]
    },
    {
      key: 'cache2.json',
      expected: () => readFixture('cache2.json')[1]
    },
    {
      key: 'undefined',
      expected: () => undefined
    }
  ])('$key', ({ key, expected }) => {
    const actual = cache.get(key)
    expect(actual).toStrictEqual(expected())
  })
})

describe('has', () => {
  test.each([
    {
      key: 'cache1.json',
      expected: true
    },
    {
      key: 'cache2.json',
      expected: true
    },
    {
      key: 'undefined',
      expected: false
    }
  ])('$key', ({ key, expected }) => {
    const actual = cache.has(key)
    expect(actual).toBe(expected)
  })
})

describe('delete', () => {
  test('cache1.json', () => {
    expect(cache.delete('cache1.json')).toBe(true)
    expect(cache.size).toBe(1)
    expect(cache.has('cache1.json')).toBe(false)
    expect([...cache]).toStrictEqual(readFixtures(['cache2.json']))
  })

  test('cache1.json & cache2.json', () => {
    expect(cache.delete('cache1.json')).toBe(true)
    expect(cache.delete('cache2.json')).toBe(true)
    expect(cache.size).toBe(0)
    expect(cache.has('cache1.json')).toBe(false)
    expect(cache.has('cache2.json')).toBe(false)
    expect([...cache]).toStrictEqual([])
  })

  test('undefined', () => {
    expect(cache.delete('undefined')).toBe(false)
    expect(cache.size).toBe(2)
    expect(cache.has('cache1.json')).toBe(true)
    expect(cache.has('cache2.json')).toBe(true)
    expect([...cache]).toStrictEqual(readFixtures())
  })
})

test('clear', () => {
  cache.clear()
  expect(cache.size).toBe(0)
  expect([...cache]).toStrictEqual([])
})
