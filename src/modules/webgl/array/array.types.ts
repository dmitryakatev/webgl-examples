import type { StructArray } from '@/modules/struct-array/struct-array'
import type { StructFieldTyple } from '@/modules/struct-array/struct-array.types'

export type StructArrayIndexesFactoryOptions = {
	capacity?: number
	multiplier?: number
	type?: 'uint8' | 'uint16' | 'uint32'
}

export type StructVertex = StructFieldTyple
export type StructIndex = [['index', 1]]

export type VertexArray<T extends StructVertex[]> = StructArray<T>
export type IndexesArray = StructArray<StructIndex>
