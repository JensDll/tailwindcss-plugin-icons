import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { vi, beforeAll, afterAll } from 'vitest'

export const iconSet = {
  prefix: '🔥',
  info: { name: '💯' },
  icons: { icon: { body: '' } },
  width: 24,
  height: 24,
}

export const handlers = {
  httpIcons: {
    path: 'http://localhost/icons.json',
    mock: vi.fn(() => HttpResponse.json(iconSet)),
  },
  httpsIcons: {
    path: 'https://localhost/icons.json',
    mock: vi.fn(() => HttpResponse.json(iconSet)),
  },
  httpNetworkError: {
    path: 'https://localhost/error',
    /** @type {import('vitest').Mock<any>} */
    mock: vi.fn(() => HttpResponse.error()),
  },
  httpBadRequest: {
    path: 'https://localhost/bad',
    mock: vi.fn(() => new HttpResponse('Not Found', { status: 404 })),
  },
}

export const server = setupServer(
  ...Object.values(handlers).map(handler =>
    http.get(handler.path, /** @type {never} */ (handler.mock)),
  ),
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => {
  server.close()
})
