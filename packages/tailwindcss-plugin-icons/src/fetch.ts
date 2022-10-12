import { createWriteStream } from 'fs'
import fs from 'fs/promises'
import path from 'path'

import { TailwindcssPluginIconsError, uriToFilename } from '@internal/shared'

const [cacheDir, ...uris] = process.argv.slice(2)

;(async () => {
  await Promise.all(uris.map(makeRequest))
  process.exit(0)
})()

async function makeRequest(uri: string) {
  const filePath = path.resolve(cacheDir, uriToFilename(uri))

  const protocol = await (uri.startsWith('https')
    ? import('https')
    : import('http'))

  return new Promise<void>((resolve, reject) => {
    protocol.get(uri, response => {
      const writeStream = createWriteStream(filePath).on('finish', resolve)

      response
        .on('data', writeStream.write.bind(writeStream))
        .on('end', async () => {
          if (response.complete && response.statusCode === 200) {
            writeStream.end()
          } else {
            await fs.unlink(filePath)
            writeStream.destroy()
            reject(
              new TailwindcssPluginIconsError(
                `Failed to fetch remote icon set at "${uri}"`
              )
            )
          }
        })
    })
  })
}
