import { createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'

import { uriToFilename } from '@internal/shared'

const [cacheDir, ...uris] = process.argv.slice(2)

;(async () => {
  try {
    await Promise.all(uris.map(makeRequest))
  } catch {
    process.exit(1)
  }

  process.exit(0)
})()

function makeRequest(uri: string) {
  const filePath = path.resolve(cacheDir, uriToFilename(uri))

  return new Promise<void>(async (resolve, reject) => {
    const protocol = await (uri.startsWith('https')
      ? import('https')
      : import('http'))

    protocol.get(uri, response => {
      const writeStream = createWriteStream(filePath)
        .on('finish', resolve)
        .on('close', reject)

      response
        .on('data', writeStream.write.bind(writeStream))
        .on('end', async () => {
          if (response.complete && response.statusCode === 200) {
            writeStream.end()
          } else {
            await fs.unlink(filePath)
            writeStream.destroy()
          }
        })
    })
  })
}
