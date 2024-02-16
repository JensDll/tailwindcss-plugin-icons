import path from 'path'

import { IconifyFileCache } from '~/src/chunks/state/cache.ts'

export const SCALE = Symbol('Icon-specific scaling')

export const cache = new IconifyFileCache(path.resolve(__dirname, 'cache'))
