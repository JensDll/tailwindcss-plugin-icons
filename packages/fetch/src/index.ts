import http from 'http'
import https from 'https'

const uris = process.argv.slice(2)

function makeRequest(uri: string) {
  return new Promise<Buffer>((resolve, reject) => {
    const protocol = uri.startsWith('https') ? https : http

    protocol.get(uri, response => {
      const buffers: Buffer[] = []

      response.on('data', buffers.push.bind(buffers))

      response.on('end', () => {
        if (response.complete && response.statusCode === 200) {
          resolve(Buffer.concat(buffers))
        } else {
          reject()
        }
      })
    })
  })
}

;(async () => {
  try {
    const result = await Promise.all(uris.map(makeRequest))

    process.stdout.write('[')
    for (let i = 0; i < result.length; ++i) {
      process.stdout.write(result[i].toString())
      if (i < result.length - 1) {
        process.stdout.write(',')
      }
    }
    process.stdout.write(']')
  } catch {
    process.exit(1)
  }

  process.exit(0)
})()
