/** @type {import('rollup').ExternalOption} */
const external = [/node:.+/, /tailwindcss\/.+/, 'vite']

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: ['src/plugin.mjs', 'src/lib.mjs'],
    output: {
      dir: 'src/dist',
      entryFileNames: '[name].mjs',
      format: 'esm',
      importAttributesKey: 'with',
    },
    external,
  },
]
