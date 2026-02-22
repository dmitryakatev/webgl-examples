export type BufferMeta = {
	size: number
	fields: BufferMetaFields
}

export type BufferMetaFields = Record<string, BufferFieldMeta>

export type BufferFieldMeta = {
	type: GLenum // тип переменной
	count: number // количество элементов в переменной. например: vec2 - 2, vec3 - 3
	offset: number // смещение, с какого байта нужно читать данные
}
