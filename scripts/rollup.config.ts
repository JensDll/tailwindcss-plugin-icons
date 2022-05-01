import replace from '@rollup/plugin-replace'
import type { OutputOptions, RollupOptions } from 'rollup'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

type PackageName = 'example'

const plugin = {
  dts: dts(),
  esbuild: esbuild({
    target: 'ES2019'
  }),
  minify: minify({
    target: 'ES2019'
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
  }
} as const

const input = (name: PackageName) => `packages/${name}/src/index.ts`

type OutputReturn = {
  readonly esm: OutputOptions
  readonly dev: OutputOptions[]
  readonly prod: OutputOptions[]
  readonly dts: OutputOptions
}

const output = (name: PackageName): OutputReturn => ({
  esm: {
    file: `packages/${name}/dist/index.mjs`,
    format: 'esm'
  },
  dev: [
    {
      file: `packages/${name}/dist/index.cjs`,
      format: 'cjs'
    },
    {
      file: `packages/${name}/dist/index.iife.js`,
      format: 'iife',
      name: 'Example',
      extend: true
    }
  ],
  prod: [
    {
      file: `packages/${name}/dist/index.min.cjs`,
      format: 'cjs',
      plugins: [plugin.minify]
    },
    {
      file: `packages/${name}/dist/index.iife.min.js`,
      format: 'iife',
      name: 'Example',
      extend: true,
      plugins: [plugin.minify]
    }
  ],
  dts: {
    file: `packages/${name}/dist/index.d.ts`,
    format: 'esm'
  }
})

const baseExternals: string[] = []

const exampleInput = input('example')
const exampleOutput = output('example')

const configs: RollupOptions[] = [
  {
    input: exampleInput,
    output: [exampleOutput.esm],
    plugins: [plugin.replace.esm, plugin.esbuild]
  },
  {
    input: exampleInput,
    output: exampleOutput.dev,
    plugins: [plugin.replace.dev, plugin.esbuild]
  },
  {
    input: exampleInput,
    output: exampleOutput.prod,
    plugins: [plugin.replace.prod, plugin.esbuild]
  },
  {
    input: exampleInput,
    output: exampleOutput.dts,
    plugins: [plugin.dts]
  }
]

configs.forEach(config => {
  if (config.external) {
    if (!Array.isArray(config.external)) {
      throw new Error('External must be an array')
    }
    config.external.push(...baseExternals)
  } else {
    config.external = baseExternals
  }
})

export default configs
