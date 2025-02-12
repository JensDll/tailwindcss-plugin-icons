import fs from 'node:fs/promises'
import http from 'node:http'
import https from 'node:https'

import { uriToFilename } from './common.mjs'

/**
 * @param {string} uri
 * @returns {Promise<void>}
 */
export async function fetchPipe(uri) {
  const protocol = uri.startsWith('https') ? https : http
  const filePath = new URL(uriToFilename(uri), import.meta.url)
  const fileHandle = await fs.open(filePath, 'w')
  const file = fileHandle.createWriteStream()
  const error = new Error(`Failed to fetch remote icon set at "${uri}"`)
  return new Promise((resolve, reject) => {
    protocol
      .get(uri, async response => {
        if (response.statusCode === 200) {
          file.on('finish', resolve)
          response.pipe(file)
        } else {
          response.resume()
          await fs.unlink(filePath)
          reject(error)
        }
      })
      .on('error', async () => {
        await fs.unlink(filePath)
        reject(error)
      })
  })
}
