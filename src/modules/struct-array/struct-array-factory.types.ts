import type {
	StructFieldTyple,
	StructFieldType,
	StructField,
} from './struct-array.types'

// info

export type StructFieldInfo = {
	name: string
	type: StructFieldType
	size: number
	offset: number
	count: number
}

export type StructArrayInfo = {
	fields: StructFieldInfo[]
	size: number
}

// options

export type StructArrayFields<T extends StructFieldTyple[]> = {
	[K in keyof T]: StructField<T[K]>
}

export type StructArrayFactoryOptions<T extends StructFieldTyple[]> = {
	fields: StructArrayFields<T>
	capacity?: number
	multiplier?: number
}
