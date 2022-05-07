import fs from 'fs'
import path from 'path'

import { uriToFilename, type IconifyJson } from '@internal/shared'

export class IconifyFileCache implements Map<string, IconifyJson> {
  cacheDir: string
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
      value: IconifyJson,
      key: string,
      map: Map<string, IconifyJson>
    ) => void,
    thisArg: any = this
  ): void {
    for (const [key, value] of this) {
      callbackfn.call(thisArg, value, key, thisArg)
    }
  }

  get(key: string): IconifyJson | undefined {
    const filePath = path.resolve(this.cacheDir, uriToFilename(key))

    if (!fs.existsSync(filePath)) {
      return
    }

    return JSON.parse(fs.readFileSync(filePath, 'ascii'))
  }

  set(key: string, iconifyJson: IconifyJson) {
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

  entries(): IterableIterator<[string, IconifyJson]> {
    return this[Symbol.iterator]()
  }

  *keys(): IterableIterator<string> {
    yield* fs.readdirSync(this.cacheDir)
  }

  *values(): IterableIterator<IconifyJson> {
    const files = fs.readdirSync(this.cacheDir)
    for (const file of files) {
      const filePath = path.resolve(this.cacheDir, file)
      yield JSON.parse(fs.readFileSync(filePath, 'ascii'))
    }
  }

  *[Symbol.iterator](): IterableIterator<[string, IconifyJson]> {
    const files = fs.readdirSync(this.cacheDir)
    for (const file of files) {
      const filePath = path.resolve(this.cacheDir, file)
      yield [file, JSON.parse(fs.readFileSync(filePath, 'ascii'))]
    }
  }

  get [Symbol.toStringTag]() {
    return `IconifyFileCache(size=${this.size})`
  }
}
