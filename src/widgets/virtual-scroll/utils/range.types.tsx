export type RenderDataOptions<T> = {
  enable: boolean
  autoDisable: number
  scroll: number
  size: number
  isDynamicSize: boolean
  blockSize: number
  positions: number[]
  stock: number
  data: T[]
}

export type RenderDataResult<T> = {
  start: number
  finish: number
  contentSize: number | null
  dataSize: number | null
  offset: number | null
  data: T[]
}
