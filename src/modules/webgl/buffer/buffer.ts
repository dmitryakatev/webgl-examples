import type { BufferMeta, BufferMetaFields } from './buffer.types'
export class Buffer {
	private _gl: WebGLRenderingContext //TODO тоже чистить??

	private _size: number
	private _fields: BufferMetaFields

	private _buffer: WebGLBuffer | null
	private _array: ArrayBuffer
	private _dirty: boolean

	private _count: number

	public get count() {
		return this._count
	}

	private get buffer() {
		if (this._buffer) {
			return this._buffer
		}

		throw 'Буфер был удален!'
	}

	constructor(gl: WebGLRenderingContext, meta: BufferMeta) {
		this._gl = gl

		this._size = meta.size
		this._fields = meta.fields

		this._buffer = gl.createBuffer()
		this._array = new ArrayBuffer(0)
		this._dirty = true

		this._count = 0
	}

	public setData(array: ArrayBuffer, count: number, force = false): void {
		if (force || (this._array !== array && this._count !== count)) {
			this._array = array
			this._count = count
			this._dirty = true
		}
	}

	public __getSize() {
		return this._size
	}

	public __getFields() {
		return this._fields
	}

	private __bindBuffer(type: GLenum): void {
		const { buffer } = this
		const gl = this._gl

		gl.bindBuffer(type, buffer)

		if (this._dirty) {
			this._dirty = false

			gl.bufferData(type, this._array, gl.STATIC_DRAW)
		}
	}

	public __bindBufferVertex(): void {
		this.__bindBuffer(this._gl.ARRAY_BUFFER)
	}

	public __bindBufferIndexes(): void {
		this.__bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER)
	}

	public destroy(): void {
		if (this._buffer) {
			this._gl.deleteBuffer(this._buffer)
			this._buffer = null
		}
	}
}
