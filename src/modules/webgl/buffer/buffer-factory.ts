import { Buffer } from './buffer'

import type { BufferMeta } from './buffer.types'
import type { StructArrayFactory } from '@/modules/struct-array'
import type {
	StructFieldType,
	StructFieldTyple,
} from '@/modules/struct-array/struct-array.types'

const types: Record<StructFieldType, GLenum> = {
	int8: WebGLRenderingContext.BYTE,
	uint8: WebGLRenderingContext.UNSIGNED_BYTE,
	int16: WebGLRenderingContext.SHORT,
	uint16: WebGLRenderingContext.UNSIGNED_SHORT,
	int32: WebGLRenderingContext.INT,
	uint32: WebGLRenderingContext.UNSIGNED_INT,
	float32: WebGLRenderingContext.FLOAT,
	float64: WebGLRenderingContext.FLOAT, // TODOвозможно не будет работать, нужно разобраться???
}

export class BufferFactory {
	private _meta: BufferMeta

	constructor(structArrayFactory: StructArrayFactory<StructFieldTyple[]>) {
		const meta = structArrayFactory.getMeta()

		this._meta = {
			size: meta.size,
			fields: {},
		}

		for (const key in meta.fields) {
			const field = meta.fields[key]

			this._meta.fields[key] = {
				type: types[field.type],
				count: field.cells.length,
				offset: field.offset,
			}
		}
	}

	public create(gl: WebGLRenderingContext) {
		return new Buffer(gl, this._meta)
	}
}
