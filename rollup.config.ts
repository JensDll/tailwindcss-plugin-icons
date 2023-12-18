import { nodeResolve } from '@rollup/plugin-node-resolve'
import type { ExternalOption, InputPluginOption, RollupOptions } from 'rollup'
import dts from 'rollup-plugin-dts'
import esbuild, { minify } from 'rollup-plugin-esbuild'

import { packagesAliasPlugin } from './scripts/rollup'
import { rootDir } from './scripts/utils.mjs'

const plugin = {
  dts: dts(),
  esbuild: esbuild({
    target: 'ES2019',
  }),
  minify: minify({
    target: 'ES2019',
  }),
  nodeResolve: nodeResolve({
    rootDir,
    resolveOnly: [/^@internal\//],
  }),
} as const

type PackageName = 'tailwindcss-plugin-icons' | 'shared'

const input = (name: PackageName, file = 'index') =>
  `packages/${name}/src/${file}.ts`

const baseExternals: ExternalOption = [
  'fs',
  'fs/promises',
  'path',
  'http',
  'https',
  'child_process',
  'crypto',
  /tailwindcss\/.+/,
]

const shared: RollupOptionsWithPlugins[] = [
  {
    input: input('shared'),
    output: {
      file: 'packages/shared/dist/index.mjs',
      format: 'esm',
    },
    plugins: [plugin.esbuild],
  },
  {
    input: input('shared'),
    output: {
      file: 'packages/shared/dist/index.d.ts',
      format: 'esm',
    },
    plugins: [plugin.dts],
  },
]

const tailwindcssPluginIcons: RollupOptionsWithPlugins[] = [
  {
    input: input('tailwindcss-plugin-icons', 'fetch'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'esm',
      manualChunks: {
        'internal/shared': ['@internal/shared'],
      },
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name].mjs',
    },
    plugins: [plugin.nodeResolve, plugin.esbuild],
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'esm',
      manualChunks: {
        'internal/shared': ['@internal/shared'],
      },
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name].mjs',
    },
    plugins: [plugin.nodeResolve, plugin.esbuild],
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'cjs',
      manualChunks: {
        'internal/shared': ['@internal/shared'],
      },
      interop: 'auto',
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs',
    },
    plugins: [plugin.nodeResolve, plugin.esbuild],
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: [
      {
        file: 'packages/tailwindcss-plugin-icons/dist/index.d.mts',
        format: 'esm',
      },
      {
        file: 'packages/tailwindcss-plugin-icons/dist/index.d.cts',
        format: 'esm',
      },
    ],
    plugins: [plugin.dts],
  },
]

const configs: RollupOptionsWithPlugins[] = [
  ...shared,
  ...tailwindcssPluginIcons,
]

configs.forEach(config => {
  config.plugins.unshift(packagesAliasPlugin)

  if (config.external) {
    if (!Array.isArray(config.external)) {
      throw new Error('External option must be an array')
    }
    config.external.push(...baseExternals)
  } else {
    config.external = baseExternals
  }
})

export default configs

interface RollupOptionsWithPlugins extends RollupOptions {
  plugins: InputPluginOption[]
}
