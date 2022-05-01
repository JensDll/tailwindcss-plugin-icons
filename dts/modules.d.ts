declare module 'tailwindcss/lib/util/flattenColorPalette' {
  declare function flattenColorPalette(colors: object): any
  export default flattenColorPalette
}

declare module 'tailwindcss/lib/util/color' {
  type Color = {
    mode: 'rgb' | 'hsl'
    color: [string, string, string]
    alpha?: string
  }

  function parseColor(value: string): Color

  function formatColor(color: Color): string
}
