import type { AttributePointer } from './emulator.types'

type GLTypedArrayConstructor =
	| Int8ArrayConstructor
	| Uint8ArrayConstructor
	| Int16ArrayConstructor
	| Uint16ArrayConstructor
	| Int32ArrayConstructor
	| Uint32ArrayConstructor
	| Float32ArrayConstructor

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

const constructors = new Map<number, GLTypedArrayConstructor>([
	[WebGLRenderingContext.BYTE, Int8Array],
	[WebGLRenderingContext.UNSIGNED_BYTE, Uint8Array],
	[WebGLRenderingContext.SHORT, Int16Array],
	[WebGLRenderingContext.UNSIGNED_SHORT, Uint16Array],
	[WebGLRenderingContext.INT, Int32Array],
	[WebGLRenderingContext.UNSIGNED_INT, Uint32Array],
	[WebGLRenderingContext.FLOAT, Float32Array],
])

const getArrayConstructor = (type: number) => {
	return constructors.get(type) as GLTypedArrayConstructor
}

export class UnpackArray {
	private fields: Field[]

	static getSize(type: number): number {
		return getArrayConstructor(type).BYTES_PER_ELEMENT
	}

	constructor(buffer: ArrayBuffer, fields: Record<string, AttributePointer>) {
		this.fields = []

		const map = new Map<number, GLTypedArray>()

		for (const name in fields) {
			const field = fields[name]
			const { type } = field
			const bytes = UnpackArray.getSize(type)

			let array = map.get(field.type)
			if (!array) {
				const Constructor = getArrayConstructor(type)
				array = new Constructor(buffer)
				map.set(type, array)
			}

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
