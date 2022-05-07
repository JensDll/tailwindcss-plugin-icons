import path from 'path'
import fs from 'fs-extra'

import { IconifyFileCache } from '../src/cache'

const testCacheContent = async (cache: IconifyFileCache) => {
  const entries = await fs.readdir(cache.cacheDir)
  expect(cache.size).toBe(entries.length)
  expect([...cache.keys()]).toEqual(entries)
  expect(Array.from(cache.values())).toEqual(
    entries.map(entry => fs.readJSONSync(`${cache.cacheDir}/${entry}`))
  )
}

let cache: IconifyFileCache

beforeEach(() => {
  cache = new IconifyFileCache(path.resolve(__dirname, 'cache'))
})

it('keys', () => {
  expect([...cache.keys()]).toStrictEqual(['entry1.json', 'entry2.json'])
})

it('values', () => {
  expect([...cache.values()]).toStrictEqual([
    fs.readJSONSync(path.resolve(__dirname, 'cache/entry1.json')),
    fs.readJSONSync(path.resolve(__dirname, 'cache/entry2.json'))
  ])
})

describe('get', () => {
  it.each([
    {
      key: 'entry1.json',
      expected: fs.readJSONSync(path.resolve(__dirname, 'cache/entry1.json'))
    },
    {
      key: 'entry2.json',
      expected: fs.readJSONSync(path.resolve(__dirname, 'cache/entry2.json'))
    },
    {
      key: 'undefined',
      expected: undefined
    }
  ])('$key', ({ key, expected }) => {
    const actual = cache.get(key)
    expect(actual).toStrictEqual(expected)
  })
})

describe('has', () => {
  it.each([
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
