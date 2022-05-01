export function add(a: number, b: number) {
  if (__DEV__) {
    console.log(
      'This is a debugging message and will be removed in the production build'
    )
  }

  return a + b
}
