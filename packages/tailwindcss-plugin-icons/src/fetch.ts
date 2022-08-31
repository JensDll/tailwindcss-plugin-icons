import path from 'path'
import fs from 'fs/promises'
import { createWriteStream } from 'fs'

import { uriToFilename } from '@internal/shared'

const [cacheDir, ...uris] = process.argv.slice(2)

;(async () => {
  try {
    await Promise.all(uris.map(makeRequest))
  } catch (e) {
    if (typeof e === 'string') {
      process.stderr.write(e)
    }

    process.exit(1)
  }

  process.exit(0)
})()

async function makeRequest(uri: string) {
  const filePath = path.resolve(cacheDir, uriToFilename(uri))

  const protocol = await (uri.startsWith('https')
    ? import('https')
    : import('http'))

  return await new Promise<void>((resolve, reject) => {
    protocol.get(uri, response => {
      const writeStream = createWriteStream(filePath).on('finish', resolve)

      response
        .on('data', writeStream.write.bind(writeStream))
        .on('end', async () => {
          if (response.complete && response.statusCode === 200) {
            writeStream.end()
          } else {
            const data = await fs.readFile(filePath)
            await fs.unlink(filePath)
            writeStream.destroy()
            reject(data.toString())
          }
        })
    })
  })
}
