const external = [/node:.+/, /tailwindcss\/.+/]

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: [
      'src/common.mjs',
      'src/css.mjs',
      'src/fetch.mjs',
      'src/plugin.mjs',
      'src/resolve.mjs',
      'src/tempFile.mjs',
    ],
    output: {
      dir: 'src/dist',
      entryFileNames: '[name].mjs',
      format: 'esm',
      importAttributesKey: 'with',
    },
    external,
  },
]
