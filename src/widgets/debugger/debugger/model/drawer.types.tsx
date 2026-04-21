import type {
	AttributePointer,
	WebGLEmulatorProgram,
	FragmentShaderFn,
	VarValues,
	UniformValues,
} from './emulator.types'

export type Rect = {
	x: number
	y: number
	width: number
	height: number
}

export type VertexValue = {
	glPos: Float32Array
	screenPos: {
		x: number
		y: number
	}
	varyings: VarValues
}

export type IndexValue = {
	indexes: [number, number, number]
}

export type TriangleMeta = {
	path: Path2D
	index: number
	bBox: BBox
	v1: VertexValue
	v2: VertexValue
	v3: VertexValue
}

export const Drawer = {
	Arrays: 1,
	Elements: 2,
} as const
export type DrawerType = (typeof Drawer)[keyof typeof Drawer]

export type DrawOptions = {
	mode: number // как рисовать треугольники
	type: number // тип буффера индексов
	offset: number // смещение в байтах
	count: number // количество вершин для отрисовки
	program: WebGLEmulatorProgram
	vertexBuffer: ArrayBuffer
	indexesBuffer: ArrayBuffer
	attributes: Record<string, AttributePointer>
	uniforms: UniformValues
}

export type BufferDrawed = {
	type: DrawerType
	index: number
	options: DrawOptions

	fragment: FragmentShaderFn
	uniforms: UniformValues

	triangles: TriangleMeta[]
	vertexes: VertexValue[]
	bBox: BBox
}

export type BBox = {
	minX: number
	minY: number
	maxX: number
	maxY: number
}

export type BBoxItem = BBox & {
	bufferIndex: number
	triangleIndex: number
}

export type Pos = {
	x: number
	y: number
}

export type Logger = {
	add(item: BufferDrawed): void
	clear(): void
}
