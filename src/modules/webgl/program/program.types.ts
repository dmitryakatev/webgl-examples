import type {
	StructFieldValue,
	StructFieldCount,
} from '@/modules/struct-array/struct-array.types'
import type { mat4 } from 'gl-matrix'

export type Shaders = {
	vertexShader: string
	fragmentShader: string
}

export type Uniforms = Record<string, StructFieldCount>
export type Matrices = string

export type UniformSetter = Record<string, (value: any) => void>
export type UniformValues<T extends Uniforms> = {
	[K in keyof T]: StructFieldValue<T[K]>
}

export type MatrixSetter = Record<string, (value: any) => void>
export type MatrixValues<T extends string> = {
	[K in T]: Float32Array | mat4
}

export type AttrItem = {
	name: string
	size: number
	type: number
	location: number
}
