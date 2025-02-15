const external = [/node:.+/, /tailwindcss\/.+/]

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
