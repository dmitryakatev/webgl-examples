import type { StructFieldTyple, Struct, StructMeta } from './struct-array.types'

export class StructArray<T extends StructFieldTyple[]> {
	private arrayBuffer!: ArrayBuffer
	private length!: number
	private capacity!: number

	private int8!: Int8Array
	private uint8!: Uint8Array
	private int16!: Int16Array
	private uint16!: Uint16Array
	private int32!: Int32Array
	private uint32!: Uint32Array
	private float32!: Float32Array
	private float64!: Float64Array

	private meta: StructMeta

	public get array() {
		return this.serialize()
	}

	public get size() {
		return this.length
	}

	constructor(meta: StructMeta) {
		this.meta = meta
		this.capacity = -1
		this.resize(0)
	}

	public push(item: Struct<T>): number {
		const count = this.length

		this.resize(count + 1)
		this.set(count, item)

		return count
	}

	public set(index: number, item: Struct<T>): void {
		const { fields } = this.meta

		for (const key in item) {
			if (Object.hasOwn(fields, key)) {
				const field = fields[key]
				const cells = field.cells
				const ln = cells.length
				const array = this[field.type]
				const value = (ln === 1 ? [item[key]] : item[key]) as number[]

				for (let i = 0; i < ln; ++i) {
					array[index * field.block + cells[i]] = value[i]
				}
			}
		}
	}

	public splice(index: number, count: number): void {
		const targetIndex = index * this.meta.size
		const nextIndex = (index + +count) * this.meta.size

		this.int8.set(this.int8.subarray(nextIndex), targetIndex)
		this.length -= count
	}

	public serialize() {
		return this.arrayBuffer.slice(0, this.length * this.meta.size)
	}

	public resize(n: number): void {
		this.length = n

		if (n > this.capacity) {
			this.capacity = Math.max(
				n,
				Math.floor(this.capacity * this.meta.multiplier),
				this.meta.capacity,
			)
			this.arrayBuffer = new ArrayBuffer(this.capacity * this.meta.size)

			const oldUint8Array = this.uint8
			this.refreshArrays()

			if (oldUint8Array) {
				this.uint8.set(oldUint8Array)
			}
		}
	}

	private refreshArrays(): void {
		this.int8 = new Int8Array(this.arrayBuffer)
		this.uint8 = new Uint8Array(this.arrayBuffer)
		this.int16 = new Int16Array(this.arrayBuffer)
		this.uint16 = new Uint16Array(this.arrayBuffer)
		this.int32 = new Int32Array(this.arrayBuffer)
		this.uint32 = new Uint32Array(this.arrayBuffer)
		this.float32 = new Float32Array(this.arrayBuffer)
		this.float64 = new Float64Array(this.arrayBuffer)
	}
}
