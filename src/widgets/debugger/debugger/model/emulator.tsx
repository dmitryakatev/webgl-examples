import GLSL from 'glsl-transpiler'

import { CanvasDrawer } from './drawer'

import type {
	WebGLEmulatorRawProgram,
	WebGLEmulatorRawShader,
	WebGLEmulatorProgram,
	AttributePointer,
} from './emulator.types'

import './stdlib-polyfill'

export class WebGLEmulatorContext {
	private _drawer: CanvasDrawer
	private _compile: ReturnType<typeof GLSL>

	private _rawShaders: WeakMap<WebGLShader, WebGLEmulatorRawShader>
	private _rawPrograms: WeakMap<WebGLProgram, WebGLEmulatorRawProgram>

	private _programs: WeakMap<WebGLProgram, WebGLEmulatorProgram>
	private _vertexBuffers: WeakMap<WebGLBuffer, ArrayBuffer | null>
	private _indexesBuffers: WeakMap<WebGLBuffer, ArrayBuffer | null>

	private _program: WebGLEmulatorProgram | null
	private _buffer: WeakRef<WebGLBuffer> | null
	private _vertexBuffer: ArrayBuffer | null
	private _indexesBuffer: ArrayBuffer | null
	private _attributes: Record<string, AttributePointer>
	private _uniforms: Record<string, number | number[]>

	constructor() {
		this._drawer = new CanvasDrawer()

		this._compile = GLSL({
			optimize: false,
			uniform: (name) => {
				return `uniforms.${name}`
			},
			attribute: (name) => {
				return `attributes.${name}`
			},
			varying: (name) => {
				return `varyings.${name}`
			},
		})

		this._rawShaders = new WeakMap()
		this._rawPrograms = new WeakMap()

		this._programs = new WeakMap()
		this._buffer = null
		this._vertexBuffers = new WeakMap()
		this._indexesBuffers = new WeakMap()

		this._program = null
		this._vertexBuffer = null
		this._indexesBuffer = null
		this._attributes = {}
		this._uniforms = {}
	}

	public __connect(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
	): void {
		this._drawer.__connect(canvas, ctx)
	}

	public __disconnect(): void {
		this._drawer.__disconnect()
	}

	// proxy methods

	// шайдеры

	public createShader(type: number, shader: WebGLShader | null): void {
		if (shader) {
			this._rawShaders.set(shader, {
				type,
				varyings: {},
			})
		} else {
			console.error('Шейдер не создан!')
		}
	}

	public shaderSource(shader: WebGLShader, source: string): void {
		const emulatorShader = this._rawShaders.get(shader)

		if (emulatorShader) {
			emulatorShader.source = source
		} else {
			console.error('Шейдер не найден!')
		}
	}

	public compileShader(shader: WebGLShader): void {
		const emulatorShader = this._rawShaders.get(shader)

		if (emulatorShader) {
			try {
				const text = this._compile(emulatorShader.source)
				let fn: any

				// init vars

				const codeVaryings: string[] = []
				for (const key in this._compile.compiler.varyings) {
					codeVaryings.push(`varyings.${key} = ${key};`)

					const varying = this._compile.compiler.varyings[key]
					const count =
						varying.type === 'vec2'
							? 2
							: varying.type === 'vec3'
								? 3
								: varying.type === 'vec4'
									? 4
									: 1

					emulatorShader.varyings[key] = count
				}
				const vars = codeVaryings.join('\n')

				// if vertex

				if (
					emulatorShader.type === WebGLRenderingContext.VERTEX_SHADER
				) {
					const source = [
						'var gl_Position = new Float32Array([0, 0, 0, 0]);',
						text,
						'main();',
						vars,
						'return gl_Position;',
					].join('\n')

					fn = Function('attributes', 'uniforms', 'varyings', source)
				}

				// if fragment

				if (
					emulatorShader.type ===
					WebGLRenderingContext.FRAGMENT_SHADER
				) {
					const source = [
						'var gl_FragColor = new Float32Array([0, 0, 0, 0]);',
						text,
						'main();',
						vars,
						'return gl_FragColor;',
					].join('\n')

					fn = Function(
						'uniforms',
						'varyings',
						'gl_FragCoord',
						source,
					)
				}

				this._compile.compiler.reset()
				if (fn) {
					emulatorShader.fn = fn as () => any
				}
			} catch (e) {
				console.error(e)
			}
		} else {
			console.error('Шейдер не найден!')
		}
	}

	public deleteShader(shader: WebGLShader | null): void {
		if (shader) {
			this._rawShaders.delete(shader)
		}
	}

	// программы

	public createProgram(program: WebGLProgram): void {
		this._rawPrograms.set(program, {})
	}

	public attachShader(program: WebGLProgram, shader: WebGLShader): void {
		const emulatorProgram = this._rawPrograms.get(program)
		const emulatorShader = this._rawShaders.get(shader)

		if (emulatorProgram && emulatorShader) {
			if (emulatorShader.type === WebGLRenderingContext.VERTEX_SHADER) {
				emulatorProgram.vertex = emulatorShader
				this._rawShaders.delete(shader)
			}

			if (emulatorShader.type === WebGLRenderingContext.FRAGMENT_SHADER) {
				emulatorProgram.fragment = emulatorShader
				this._rawShaders.delete(shader)
			}
		} else {
			console.error('Шейдер не был прикреплен!')
		}
	}

	public linkProgram(program: WebGLProgram): void {
		const emulatorProgram = this._rawPrograms.get(program)

		if (emulatorProgram) {
			if (emulatorProgram.vertex && emulatorProgram.fragment) {
				const varyings: Record<string, number> = {}

				Object.assign(
					varyings,
					emulatorProgram.vertex.varyings,
					emulatorProgram.fragment.varyings,
				)

				this._programs.set(program, {
					vertex: emulatorProgram.vertex.fn,
					fragment: emulatorProgram.fragment.fn,
					attributes: new Map(),
					uniforms: new WeakMap(),
					varyings,
				})
				this._rawPrograms.delete(program)
			}
		}
	}

	public deleteProgram(program: WebGLProgram | null): void {
		if (program) {
			this._rawPrograms.delete(program)
		}
	}

	// получение информации по атрибутам и юниформам

	public getAttribLocation(
		program: WebGLProgram,
		name: string,
		location: number,
	): void {
		const emulatorProgram = this._programs.get(program)

		if (emulatorProgram) {
			emulatorProgram.attributes.set(location, name)
		}
	}

	public getUniformLocation(
		program: WebGLProgram,
		name: string,
		location: WebGLUniformLocation | null,
	): void {
		const emulatorProgram = this._programs.get(program)

		if (emulatorProgram && location) {
			emulatorProgram.uniforms.set(location, name)
		}
	}

	// uniform

	public uniform1f(location: WebGLUniformLocation | null, x: number): void {
		this.setUniform(location, x)
	}

	public uniform2fv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	public uniform3fv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	public uniform4fv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	public uniform2iv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	public uniform3iv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	public uniform4iv(
		location: WebGLUniformLocation | null,
		v: number[],
	): void {
		this.setUniform(location, v)
	}

	// matrix

	public uniformMatrix2fv(
		location: WebGLUniformLocation | null,
		_transpose: boolean,
		value: number[],
	): void {
		this.setUniform(location, value)
	}

	public uniformMatrix3fv(
		location: WebGLUniformLocation | null,
		_transpose: boolean,
		value: number[],
	): void {
		this.setUniform(location, value)
	}

	public uniformMatrix4fv(
		location: WebGLUniformLocation | null,
		_transpose: boolean,
		value: number[],
	): void {
		this.setUniform(location, value)
	}

	private setUniform(
		location: WebGLUniformLocation | null,
		value: number | number[],
	): void {
		if (this._program && location) {
			const name = this._program.uniforms.get(location)

			if (name) {
				this._uniforms[name] = value
			}
		}
	}

	// viewport

	public viewport(x: number, y: number, width: number, height: number): void {
		this._drawer.viewport(x, y, width, height)
	}

	public clear(_mask: number): void {
		this._drawer.clear()
	}

	// buffer

	public bindBuffer(target: number, buffer: WebGLBuffer | null): void {
		const buffers =
			target === WebGLRenderingContext.ARRAY_BUFFER
				? this._vertexBuffers
				: target === WebGLRenderingContext.ELEMENT_ARRAY_BUFFER
					? this._indexesBuffers
					: null

		if (buffers && buffer) {
			this._buffer = new WeakRef(buffer)

			const data = buffers.get(buffer)

			if (data) {
				this.changeData(target, data, false)
			}
		}
	}

	public bufferData(
		target: number,
		data: AllowSharedBufferSource | null,
		_usage: GLenum,
	): void {
		this.changeData(target, data as ArrayBuffer, true)
	}

	private changeData(
		target: number,
		data: ArrayBuffer, // TODO
		write: boolean,
	): void {
		if (this._buffer) {
			const buffer = this._buffer.deref()

			if (buffer && data) {
				if (target === WebGLRenderingContext.ARRAY_BUFFER) {
					this._vertexBuffer = data

					if (write) {
						this._vertexBuffers.set(buffer, data as ArrayBuffer)
					}
				}

				if (target === WebGLRenderingContext.ELEMENT_ARRAY_BUFFER) {
					this._indexesBuffer = data

					if (write) {
						this._indexesBuffers.set(buffer, data as ArrayBuffer)
					}
				}
			}
		}
	}

	public deleteBuffer(buffer: WebGLBuffer | null): void {
		if (buffer) {
			this._vertexBuffers.delete(buffer)
			this._indexesBuffers.delete(buffer)
		}
	}

	public vertexAttribPointer(
		index: number,
		size: number,
		type: number,
		_normalized: boolean,
		stride: number,
		offset: number,
	): void {
		if (this._program && location) {
			const name = this._program.attributes.get(index)

			if (name) {
				this._attributes[name] = {
					size,
					type,
					stride,
					offset,
				}
			}
		}
	}

	// рисование

	public useProgram(program: WebGLProgram | null): void {
		if (program) {
			const emulatorProgram = this._programs.get(program)

			if (emulatorProgram) {
				this._program = emulatorProgram
				this._buffer = null
				this._vertexBuffer = null
				this._indexesBuffer = null
				this._attributes = {}
				this._uniforms = {}
			}
		}
	}

	public drawArrays(mode: number, first: number, count: number): void {
		if (this._program && this._vertexBuffer) {
			this._drawer.drawArrays(
				mode,
				first,
				count,
				this._program,
				this._vertexBuffer,
				this._attributes,
				this._uniforms,
			)
		}
	}

	public drawElements(
		mode: number,
		count: number,
		type: number,
		offset: number,
	): void {
		if (this._program && this._vertexBuffer && this._indexesBuffer) {
			this._drawer.drawElements(
				mode,
				count,
				type,
				offset,
				this._program,
				this._vertexBuffer,
				this._indexesBuffer,
				this._attributes,
				this._uniforms,
			)
		}
	}
}
