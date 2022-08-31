import path from 'node:path'
import crypto from 'node:crypto'
import os from 'node:os'

import fs from 'fs-extra'
import type { IconifyJSON } from '@iconify/types'

import { IconifyFileCache } from '../src/cache'

let cache: IconifyFileCache

const allFixtures = fs.readdirSync(path.resolve(__dirname, 'fixtures'))

const readFixture = (fixture: string) =>
  [
    fixture,
    fs.readJSONSync(path.resolve(__dirname, 'fixtures', fixture), 'ascii')
  ] as const

const readFixtures = (fixtures?: string[]) =>
  (fixtures === undefined ? allFixtures : fixtures).map(readFixture)

beforeEach(() => {
  cache = new IconifyFileCache(path.resolve(os.tmpdir(), crypto.randomUUID()))
  cache.set(...readFixture('entry1.json')).set(...readFixture('entry2.json'))
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
      key: 'entry1.json',
      expected: () => readFixture('entry1.json')[1]
    },
    {
      key: 'entry2.json',
      expected: () => readFixture('entry2.json')[1]
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
      key: 'entry1.json',
      expected: true
    },
    {
      key: 'entry2.json',
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
  test('entry1.json', () => {
    expect(cache.delete('entry1.json')).toBe(true)
    expect(cache.size).toBe(1)
    expect(cache.has('entry1.json')).toBe(false)
    expect([...cache]).toStrictEqual(readFixtures(['entry2.json']))
  })

  test('entry1.json & entry2.json', () => {
    expect(cache.delete('entry1.json')).toBe(true)
    expect(cache.delete('entry2.json')).toBe(true)
    expect(cache.size).toBe(0)
    expect(cache.has('entry1.json')).toBe(false)
    expect(cache.has('entry2.json')).toBe(false)
    expect([...cache]).toStrictEqual([])
  })

  test('undefined', () => {
    expect(cache.delete('undefined')).toBe(false)
    expect(cache.size).toBe(2)
    expect(cache.has('entry1.json')).toBe(true)
    expect(cache.has('entry2.json')).toBe(true)
    expect([...cache]).toStrictEqual(readFixtures())
  })
})

test('clear', () => {
  cache.clear()
  expect(cache.size).toBe(0)
  expect([...cache]).toStrictEqual([])
})
