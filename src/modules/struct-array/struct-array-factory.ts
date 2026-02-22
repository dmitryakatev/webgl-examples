import { StructArray } from './struct-array'

import type {
	StructArrayFactoryOptions,
	StructArrayFields,
	StructArrayInfo,
	StructFieldInfo,
} from './struct-array-factory.types'
import type {
	StructFieldTyple,
	ContructorFieldType,
	StructFieldType,
	StructMeta,
	StructFieldMeta,
} from './struct-array.types'

const constructors: ContructorFieldType = {
	int8: Int8Array,
	uint8: Uint8Array,
	int16: Int16Array,
	uint16: Uint16Array,
	int32: Int32Array,
	uint32: Uint32Array,
	float32: Float32Array,
	float64: Float64Array,
}

const align = (offset: number, size: number) => {
	return Math.ceil(offset / size) * size
}

const sizeOf = (type: StructFieldType) => {
	return constructors[type].BYTES_PER_ELEMENT
}

export class StructArrayFactory<T extends StructFieldTyple[]> {
	private _meta: StructMeta

	constructor(options: StructArrayFactoryOptions<T>) {
		const { size, fields } = this.normalize(options.fields)
		const f = this.createFields(size, fields)

		this._meta = {
			fields: f,
			size,
			capacity: options.capacity ?? 10,
			multiplier: options.multiplier ?? 2,
		}
	}

	public create() {
		return new StructArray<T>(this._meta)
	}

	public getMeta() {
		return this._meta
	}

	private normalize(raw: StructArrayFields<T>): StructArrayInfo {
		const fields: StructFieldInfo[] = []

		let offset = 0
		let maxSize = 0

		for (let i = 0; i < raw.length; ++i) {
			const { name, type, count } = raw[i]
			const size = sizeOf(type)

			maxSize = Math.max(maxSize, size)
			offset = align(offset, size)

			fields.push({
				name,
				type,
				size,
				offset,
				count,
			})

			offset += size * count
		}

		return {
			size: align(offset, maxSize),
			fields,
		}
	}

	private createFields(maxSize: number, raw: StructFieldInfo[]) {
		const fields: Record<string, StructFieldMeta> = {}

		for (let i = 0; i < raw.length; ++i) {
			const { name, type, size, offset, count } = raw[i]
			const block = Math.round(maxSize / size)
			const cells: number[] = []

			fields[name] = {
				type,
				cells,
				block,
				offset,
			}

			for (let k = 0; k < count; ++k) {
				cells.push(Math.round(offset / size) + k)
			}
		}

		return fields
	}
}
