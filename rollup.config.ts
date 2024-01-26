import type {
  ExternalOption,
  InputPluginOption,
  RollupOptions,
  GetManualChunk,
} from 'rollup'
import { dts } from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

import {
  tildeAliasPlugin,
  sharedChunkAliasPlugin,
  stateChunkAliasPlugin,
} from './scripts/rollup'

const dtsPlugin = dts({
  respectExternal: true,
})

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

const manualChunks: GetManualChunk = id => {
  if (id.includes('chunks/shared')) {
    return 'chunks/shared'
  }
}

const configs: RollupOptionsWithPlugins[] = [
  {
    input: 'src/fetch.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      manualChunks,
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name].mjs',
    },
    external: [...externals],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/chunks/state/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      manualChunks,
      entryFileNames: 'chunks/state.cjs',
      chunkFileNames: '[name].cjs',
    },
    external: [...externals],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        manualChunks,
        paths: {
          '@chunks/state': './chunks/state.cjs',
        },
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name].cjs',
      },
      {
        dir: 'dist',
        format: 'esm',
        manualChunks,
        paths: {
          '@chunks/state': './chunks/state.cjs',
        },
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name].mjs',
      },
    ],
    external: [...externals, '@chunks/state'],
    plugins: [tildeAliasPlugin, sharedChunkAliasPlugin, esbuildPlugin],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.d.cts',
        format: 'esm',
      },
      {
        file: 'dist/index.d.mts',
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
]

export default configs

interface RollupOptionsWithPlugins extends RollupOptions {
  plugins: InputPluginOption[]
}
