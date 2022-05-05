import replace from '@rollup/plugin-replace'
import type { OutputOptions, RollupOptions, ExternalOption } from 'rollup'
import esbuild, { minify } from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const plugin = {
  dts: dts(),
  esbuild: esbuild({
    target: 'ES2019'
  }),
  esbuildNext: esbuild({
    target: 'ESNext'
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

type PackageName = 'tailwindcss-plugin-icons' | 'fetch'

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
    }
  ],
  prod: [
    {
      file: `packages/${name}/dist/index.min.cjs`,
      format: 'cjs',
      plugins: [plugin.minify]
    }
  ],
  dts: {
    file: `packages/${name}/dist/index.d.ts`,
    format: 'esm'
  }
})

const baseExternals: ExternalOption = [
  'fs',
  'path',
  'http',
  'https',
  'child_process',
  /tailwindcss\/.+/
]

const packages = {
  main: {
    input: input('tailwindcss-plugin-icons'),
    output: output('tailwindcss-plugin-icons')
  },
  fetch: {
    input: input('fetch'),
    output: {
      file: 'packages/tailwindcss-plugin-icons/dist/fetch.mjs',
      format: 'esm'
    } as OutputOptions
  }
} as const

const configs: RollupOptions[] = [
  {
    input: packages.fetch.input,
    output: packages.fetch.output,
    plugins: [plugin.replace.esm, plugin.esbuildNext]
  },
  {
    input: packages.main.input,
    output: [packages.main.output.esm],
    plugins: [plugin.replace.esm, plugin.esbuild]
  },
  {
    input: packages.main.input,
    output: packages.main.output.dev,
    plugins: [plugin.replace.dev, plugin.esbuild]
  },
  {
    input: packages.main.input,
    output: packages.main.output.prod,
    plugins: [plugin.replace.prod, plugin.esbuild]
  },
  {
    input: packages.main.input,
    output: packages.main.output.dts,
    plugins: [plugin.dts]
  }
]

configs.forEach(config => {
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
