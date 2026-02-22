export type ContructorFieldType = {
	int8: Int8ArrayConstructor
	uint8: Uint8ArrayConstructor
	int16: Int16ArrayConstructor
	uint16: Uint16ArrayConstructor
	int32: Int32ArrayConstructor
	uint32: Uint32ArrayConstructor
	float32: Float32ArrayConstructor
	float64: Float64ArrayConstructor
}

export type StructFieldCount = 1 | 2 | 3 | 4
export type StructFieldType = keyof ContructorFieldType

// struct

type ExtractValue<
	T extends number,
	Acc extends number[] = [],
> = Acc['length'] extends T ? Acc : ExtractValue<T, [...Acc, number]>

export type StructFieldValue<T extends number> = T extends 1
	? number
	: ExtractValue<T>

export type StructFieldTyple = [name: string, count: StructFieldCount]

export type Struct<T extends StructFieldTyple[]> = {
	[K in T[number] as K[0]]: StructFieldValue<K[1]>
}

export type StructField<T extends StructFieldTyple> = {
	name: T[0]
	type: StructFieldType
	count: T[1]
}

// meta

export type StructMeta = {
	fields: Record<string, StructFieldMeta>
	size: number
	capacity: number
	multiplier: number
}

export type StructFieldMeta = {
	type: StructFieldType
	cells: number[]
	block: number
	offset: number
}
