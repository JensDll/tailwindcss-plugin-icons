import path from 'node:path'

import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import alias from '@rollup/plugin-alias'
import type { ExternalOption, RollupOptions } from 'rollup'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const rootDir = path.resolve(__dirname, '..')

const plugin = {
  dts: dts(),
  esbuild: esbuild({
    target: 'ES2019'
  }),
  minify: minify({
    target: 'ES2019'
  }),
  nodeResolve: nodeResolve({
    rootDir,
    resolveOnly: ['@internal/shared']
  }),
  replace: {
    esm: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: "(process.env.NODE_ENV !== 'production')"
    }),
    dev: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: true,
      'process.env.NODE_ENV': null
    }),
    prod: replace({
      preventAssignment: true,
      objectGuard: true,
      __DEV__: false,
      'process.env.NODE_ENV': "'production'"
    })
  },
  alias: alias({
    customResolver(source) {
      return source + '.ts'
    },
    entries: [
      {
        find: /^~(.+)\/(.+)/,
        replacement: path.resolve(rootDir, 'packages/$1/src/$2')
      }
    ]
  })
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
  /tailwindcss\/.+/
]

const shared: RollupOptions[] = [
  {
    input: input('shared'),
    output: {
      file: 'packages/shared/dist/index.mjs',
      format: 'esm'
    },
    plugins: [plugin.replace.esm, plugin.esbuild]
  },
  {
    input: input('shared'),
    output: {
      file: 'packages/shared/dist/index.d.ts',
      format: 'esm'
    },
    plugins: [plugin.dts]
  }
]

const tailwindcssPluginIcons: RollupOptions[] = [
  {
    input: input('tailwindcss-plugin-icons', 'fetch'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'esm',
      manualChunks: {
        'internal/shared': ['@internal/shared']
      },
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name].mjs'
    },
    plugins: [plugin.replace.esm, plugin.nodeResolve, plugin.esbuild]
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'esm',
      manualChunks: {
        'internal/shared': ['@internal/shared']
      },
      entryFileNames: '[name].mjs',
      chunkFileNames: '[name].mjs'
    },
    plugins: [plugin.replace.esm, plugin.nodeResolve, plugin.esbuild]
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'cjs',
      manualChunks: {
        'internal/shared': ['@internal/shared']
      },
      entryFileNames: '[name].cjs',
      chunkFileNames: '[name].cjs'
    },
    plugins: [plugin.replace.dev, plugin.nodeResolve, plugin.esbuild]
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      dir: 'packages/tailwindcss-plugin-icons/dist',
      format: 'cjs',
      manualChunks: {
        'internal/shared': ['@internal/shared']
      },
      entryFileNames: '[name].min.cjs',
      chunkFileNames: '[name].min.cjs',
      plugins: [plugin.minify]
    },
    plugins: [plugin.replace.prod, plugin.nodeResolve, plugin.esbuild]
  },
  {
    input: input('tailwindcss-plugin-icons'),
    output: {
      file: 'packages/tailwindcss-plugin-icons/dist/index.d.ts',
      format: 'esm'
    },
    plugins: [plugin.dts]
  }
]

const configs: RollupOptions[] = [...shared, ...tailwindcssPluginIcons]

configs.forEach(config => {
  config.plugins?.unshift(plugin.alias)

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
