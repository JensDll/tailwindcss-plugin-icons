import { expect, test } from 'vitest'

import { withResolvers } from '../src/lib.mjs'

test('resolve', async () => {
  let { promise, resolve } = withResolvers()
  resolve()
  await expect(promise).resolves.toBeUndefined()
  ;({ promise, resolve } = withResolvers())
  resolve(42)
  await expect(promise).resolves.toBe(42)
})

test('reject', async () => {
  let { promise, reject } = withResolvers()
  reject()
  await expect(promise).rejects.toBeUndefined()
  ;({ promise, reject } = withResolvers())
  reject(42)
  await expect(promise).rejects.toBe(42)
})
