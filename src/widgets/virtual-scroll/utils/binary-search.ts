const ascending = (a: number, b: number) => (
  a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN
)

export const indexLeft = <T>(array: Array<T>, num: number, accessor?: (item: T) => number) => {
  let lo = 0
  let hi = array.length
  let mid
  let value

  if (!accessor) {
    accessor = (v) => v as number
  }

  while (lo < hi) {
    mid = lo + hi >>> 1
    value = accessor(array[mid])

    if (ascending(value, num) < 0) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }

  return lo
}
