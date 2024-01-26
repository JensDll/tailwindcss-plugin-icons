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

const manualChunks = {
  'chunks/shared': ['src/chunks/shared/index.ts'],
}

const paths = {
  '@chunks/state': './chunks/state.cjs',
}

export default [
  {
    input: 'src/chunks/state/index.ts',
    output: {
      dir: 'src/dist',
      format: 'cjs',
      manualChunks,
      entryFileNames: 'chunks/state.cjs',
      chunkFileNames: '[name]-[hash].cjs',
    },
    external: [...externals],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/fetch.ts',
    output: {
      dir: 'src/dist',
      format: 'esm',
      manualChunks,
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name]-[hash].mjs',
    },
    external: [...externals],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'src/dist',
        format: 'cjs',
        interop: 'auto',
        paths,
        manualChunks,
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name]-[hash].cjs',
      },
      {
        dir: 'src/dist',
        format: 'esm',
        paths,
        manualChunks,
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs',
      },
    ],
    external: [...externals, '@chunks/state'],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
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
