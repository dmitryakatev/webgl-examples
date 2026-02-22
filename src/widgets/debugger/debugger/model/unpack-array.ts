import type { AttributePointer } from './emulator.types'

type GLTypedArray =
	| Int8Array
	| Uint8Array
	| Int16Array
	| Uint16Array
	| Int32Array
	| Uint32Array
	| Float32Array

type Field = {
	name: string
	array: GLTypedArray
	count: number
	index: number
	block: number
}

const sizes = new Map<number, number>([
	[WebGLRenderingContext.BYTE, Int8Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.UNSIGNED_BYTE, Uint8Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.SHORT, Int16Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.UNSIGNED_SHORT, Uint16Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.INT, Int32Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.UNSIGNED_INT, Uint32Array.BYTES_PER_ELEMENT],
	[WebGLRenderingContext.FLOAT, Float32Array.BYTES_PER_ELEMENT],
])

export class UnpackArray {
	private fields: Field[]

	static getSize(type: number): number {
		return sizes.get(type) as number
	}

	constructor(array: ArrayBuffer, fields: Record<string, AttributePointer>) {
		this.fields = []

		const map = new Map<number, GLTypedArray>([
			[WebGLRenderingContext.BYTE, new Int8Array(array)],
			[WebGLRenderingContext.UNSIGNED_BYTE, new Uint8Array(array)],
			[WebGLRenderingContext.SHORT, new Int16Array(array)],
			[WebGLRenderingContext.UNSIGNED_SHORT, new Uint16Array(array)],
			[WebGLRenderingContext.INT, new Int32Array(array)],
			[WebGLRenderingContext.UNSIGNED_INT, new Uint32Array(array)],
			[WebGLRenderingContext.FLOAT, new Float32Array(array)],
		])

		for (const name in fields) {
			const field = fields[name]
			const array = map.get(field.type) as GLTypedArray
			const bytes = UnpackArray.getSize(field.type)

			this.fields.push({
				name,
				array,
				count: field.size,
				index: Math.round(field.offset / bytes),
				block: Math.round(field.stride / bytes),
			})
		}
	}

	public unpack(i: number): Record<string, number | number[]> {
		const result: Record<string, number | number[]> = {}

		for (const { name, array, count, block, index } of this.fields) {
			if (count === 1) {
				result[name] = array[block * i + index]
			} else {
				const arr: number[] = []
				result[name] = arr

				for (let k = 0; k < count; ++k) {
					arr.push(array[block * i + index + k])
				}
			}
		}

		return result
	}
}
