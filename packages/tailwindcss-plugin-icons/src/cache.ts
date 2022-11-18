import fs from 'fs'
import path from 'path'

import type { IconifyJSON } from '@iconify/types'
import { readJson, uriToFilename } from '@internal/shared'

export class IconifyFileCache implements Map<string, IconifyJSON> {
  readonly cacheDir: string
  size: number

  constructor(cacheDir: string) {
    this.cacheDir = cacheDir

    if (fs.existsSync(this.cacheDir)) {
      this.size = fs.readdirSync(this.cacheDir).length
    } else {
      this.size = 0
      fs.mkdirSync(this.cacheDir)
    }
  }

  clear(): void {
    const files = fs.readdirSync(this.cacheDir)
    for (const file of files) {
      const filePath = path.resolve(this.cacheDir, file)
      fs.unlinkSync(filePath)
    }
    this.size = 0
  }

  delete(key: string): boolean {
    const filePath = path.resolve(this.cacheDir, uriToFilename(key))

    if (!fs.existsSync(filePath)) {
      return false
    }

    fs.unlinkSync(filePath)
    this.size--

    return true
  }

  forEach(
    callbackfn: (
      value: IconifyJSON,
      key: string,
      map: Map<string, IconifyJSON>
    ) => void,
    thisArg: any = this
  ): void {
    for (const [key, value] of this) {
      callbackfn.call(thisArg, value, key, this)
    }
  }

  get(key: string): IconifyJSON | undefined {
    const filePath = path.resolve(this.cacheDir, uriToFilename(key))

    if (!fs.existsSync(filePath)) {
      return
    }

    return readJson(filePath)
  }

  set(key: string, iconifyJson: IconifyJSON) {
    const filePath = path.resolve(this.cacheDir, uriToFilename(key))

    if (fs.existsSync(filePath)) {
      return this
    }

    this.size++
    fs.writeFileSync(filePath, JSON.stringify(iconifyJson))

    return this
  }

  has(key: string): boolean {
    const filePath = path.resolve(this.cacheDir, uriToFilename(key))
    return fs.existsSync(filePath)
  }

  entries(): IterableIterator<[string, IconifyJSON]> {
    return this[Symbol.iterator]()
  }

  *keys(): IterableIterator<string> {
    yield* fs.readdirSync(this.cacheDir)
  }

  *values(): IterableIterator<IconifyJSON> {
    const files = fs.readdirSync(this.cacheDir)
    for (const file of files) {
      const filePath = path.resolve(this.cacheDir, file)
      yield readJson(filePath)
    }
  }

  *[Symbol.iterator](): IterableIterator<[string, IconifyJSON]> {
    const files = fs.readdirSync(this.cacheDir)
    for (const file of files) {
      const filePath = path.resolve(this.cacheDir, file)
      yield [file, readJson(filePath)]
    }
  }

  get [Symbol.toStringTag]() {
    return `IconifyFileCache(size=${this.size})`
  }
}
