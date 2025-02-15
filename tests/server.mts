import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import { Mock, vi } from 'vitest'

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
    mock: vi.fn(() => HttpResponse.error()) as Mock<any>,
  },
  httpBadRequest: {
    path: 'https://localhost/bad',
    mock: vi.fn(() => new HttpResponse('Not Found', { status: 404 })),
  },
}

export const server = setupServer(
  ...Object.values(handlers).map(value =>
    http.get(value.path, value.mock as never),
  ),
)
