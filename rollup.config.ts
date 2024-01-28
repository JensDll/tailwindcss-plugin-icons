import type { ExternalOption, RollupOptions } from 'rollup'
import { dts } from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import {
  tildeAliasPlugin,
  sharedChunkAliasPlugin,
  stateChunkAliasPlugin,
} from './scripts/rollup'

const dtsPlugin = dts()

const esbuildPlugin = esbuild({
  target: 'ES2019',
})

const externals: ExternalOption = [
  'fs',
  'fs/promises',
  'path',
  'http',
  'https',
  'child_process',
  'crypto',
  /tailwindcss\/.+/,
]

export default [
  {
    input: 'src/chunks/shared/index.ts',
    output: [
      {
        file: 'src/dist/chunks/shared.cjs',
        format: 'cjs',
      },
      {
        file: 'src/dist/chunks/shared.mjs',
        format: 'esm',
      },
    ],
    external: [...externals],
    plugins: [tildeAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/chunks/state/index.ts',
    output: {
      file: 'src/dist/chunks/state.cjs',
      format: 'cjs',
      paths: {
        '@chunks/shared': './shared.cjs',
      },
    },
    external: [...externals, '@chunks/shared'],
    plugins: [tildeAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/fetch.ts',
    output: {
      file: 'src/dist/fetch.mjs',
      format: 'esm',
      paths: {
        '@chunks/shared': './chunks/shared.mjs',
      },
    },
    external: [...externals, '@chunks/shared'],
    plugins: [tildeAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'src/dist/index.cjs',
        format: 'cjs',
        interop: 'auto',
        intro: "require('crypto');",
        paths: {
          '@chunks/shared': './chunks/shared.cjs',
          '@chunks/state': './chunks/state.cjs',
        },
      },
      {
        file: 'src/dist/index.mjs',
        format: 'esm',
        intro: "import 'crypto';",
        paths: {
          '@chunks/shared': './chunks/shared.mjs',
          '@chunks/state': './chunks/state.cjs',
        },
      },
    ],
    external: [...externals, '@chunks/state', '@chunks/shared'],
    plugins: [tildeAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'src/dist/index.d.cts',
        format: 'esm',
      },
      {
        file: 'src/dist/index.d.mts',
        format: 'esm',
      },
    ],
    external: [...externals],
    plugins: [
      tildeAliasPlugin,
      sharedChunkAliasPlugin,
      stateChunkAliasPlugin,
      dtsPlugin,
    ],
  },
] as RollupOptions[]
