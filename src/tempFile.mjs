import crypto from 'node:crypto'
import fs from 'node:fs/promises'

export class TempFile {
  /**
   * @type {URL}
   */
  #tempPath

  /**
   * @type {string}
   */
  #commitName

  /**
   * @type {import('fs/promises').FileHandle | undefined}
   */
  #fileHandle

  /**
   * @param {string} commitName
   */
  constructor(commitName) {
    this.#tempPath = new URL(crypto.randomUUID(), import.meta.url)
    this.#commitName = commitName
  }

  async open() {
    this.#fileHandle = await fs.open(this.#tempPath, 'w')
    return this.#fileHandle.createWriteStream({ autoClose: false })
  }

  async [Symbol.asyncDispose]() {
    if (this.#fileHandle) {
      console.log('commit', this.#commitName)
      await this.#fileHandle.close()
      return fs.rename(
        this.#tempPath,
        new URL(this.#commitName, import.meta.url),
      )
    }
  }
}
