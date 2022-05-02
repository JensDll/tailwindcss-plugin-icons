import { toKebabCase } from '../src/utils'

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
    const result = toKebabCase(value)
    expect(result).toBe(expected)
  })
})
