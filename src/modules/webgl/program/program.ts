// TODO общие типы которые используются и в struct array и тут, мб их вынести в общие utily types??
import type {
	AttrItem,
	Matrices,
	MatrixSetter,
	MatrixValues,
	Shaders,
	Uniforms,
	UniformSetter,
	UniformValues,
} from './program.types'
import type { Buffer } from '../buffer/buffer'

export abstract class Program<U extends Uniforms, M extends Matrices = never> {
	private _gl: WebGLRenderingContext
	private _program: WebGLProgram

	private _uniform: UniformSetter
	private _matrix: MatrixSetter
	private _attrs: AttrItem[]

	private _count: number
	private _typeIndex: GLenum | -1

	public get program() {
		if (this._program) {
			return this._program
		}

		throw 'Программа не найдена'
	}

	public get __attrs() {
		return this._attrs
	}

	constructor(gl: WebGLRenderingContext) {
		const { vertexShader, fragmentShader } = this.getShaders()
		const program = this.createProgram(gl, vertexShader, fragmentShader)

		this._gl = gl
		this._program = program

		this._uniform = {} as UniformSetter
		this._matrix = {} as MatrixSetter
		this._attrs = []

		this._count = 0
		this._typeIndex = -1

		this.initUniforms()
		this.initAttributes()
	}

	public useProgram(): void {
		this._gl.useProgram(this.program)
	}

	public setUniforms(values: Partial<UniformValues<U>>): void {
		const uniforms = this._uniform

		for (const key in values) {
			if (Object.hasOwn(uniforms, key)) {
				uniforms[key](values[key])
			}
		}
	}

	public setMatrices(values: Partial<MatrixValues<M>>): void {
		const matrices = this._matrix

		for (const key in values) {
			if (Object.hasOwn(matrices, key)) {
				matrices[key](values[key])
			}
		}
	}

	public setBuffer(buffer: Buffer, indexes?: Buffer): void {
		this.setBufferVertex(buffer)

		if (indexes) {
			this.setBufferIndexes(indexes)
		}
	}

	public draw(): void {
		const gl = this._gl

		if (this._typeIndex === -1) {
			gl.drawArrays(gl.TRIANGLES, 0, this._count)
		} else {
			gl.drawElements(gl.TRIANGLES, this._count, this._typeIndex, 0)
		}
	}

	private setBufferVertex(buffer: Buffer): void {
		const size = buffer.__getSize()
		const fields = buffer.__getFields()
		const gl = this._gl

		buffer.__bindBufferVertex()

		for (const attr of this._attrs) {
			const field = fields[attr.name]

			if (field) {
				gl.enableVertexAttribArray(attr.location)
				gl.vertexAttribPointer(
					attr.location, // ссылка на атрибут
					field.count, // кол-во данных внутри переменных, если это вектор то это набор данных
					field.type, // тип данных
					false, // не нормализовать данные
					size, // количеоство байт в одной структуре
					field.offset, // с какого байта брать данные внутри структуры, те смещение
				)
			}
		}

		this._count = buffer.count
		this._typeIndex = -1
	}

	private setBufferIndexes(buffer: Buffer): void {
		const fields = buffer.__getFields()
		const type = Object.values(fields)[0].type

		buffer.__bindBufferIndexes()

		// нужно будет передавать количество вершин
		// а массив с индексами хранит количество треугольников
		// преобразуем в количество вершин
		this._count = buffer.count * 3
		this._typeIndex = type
	}

	protected abstract getShaders(): Shaders

	private createAndCompileShader(
		gl: WebGLRenderingContext,
		type: GLenum,
		source: string,
	) {
		const shader = gl.createShader(type)

		if (!shader) {
			console.error('Не удалось создать шейдер')
			return null
		}

		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

		if (!compiled) {
			console.error('Не удалось скомпилировать шейдер')
			gl.deleteShader(shader)
			return null
		}

		return shader
	}

	private createProgram(
		gl: WebGLRenderingContext,
		vertexShader: string,
		fragmentShader: string,
	) {
		const vertex = this.createAndCompileShader(
			gl,
			gl.VERTEX_SHADER,
			vertexShader,
		)
		const fragment = this.createAndCompileShader(
			gl,
			gl.FRAGMENT_SHADER,
			fragmentShader,
		)

		if (!vertex || !fragment) {
			throw 'error init program'
		}

		const program = gl.createProgram()

		if (!program) {
			console.error('Не удалось создать программу')
			throw 'error init program'
		}

		gl.attachShader(program, vertex)
		gl.attachShader(program, fragment)

		gl.linkProgram(program)

		const linked = gl.getProgramParameter(program, gl.LINK_STATUS)

		if (!linked) {
			gl.deleteProgram(program)
			gl.deleteShader(vertex)
			gl.deleteShader(fragment)

			console.error('Не удалось связать программу')
			throw 'error init program'
		}

		return program
	}

	private initAttributes() {
		const gl = this._gl
		const program = this._program
		const count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

		const attrs = this._attrs

		for (let i = 0; i < count; i++) {
			const attribute = gl.getActiveAttrib(program, i)

			if (attribute) {
				const location = gl.getAttribLocation(program, attribute.name)

				attrs.push({
					name: attribute.name,
					size: attribute.size,
					type: attribute.type,
					location,
				})
			}
		}
	}

	private initUniforms() {
		const gl = this._gl
		const program = this._program
		const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)

		const setters = this._uniform
		const matrix = this._matrix

		for (let i = 0; i < count; i++) {
			const uniform = gl.getActiveUniform(program, i)

			if (uniform) {
				const name = uniform.name
				const location = gl.getUniformLocation(program, name)

				switch (uniform.type) {
					case WebGLRenderingContext.FLOAT:
						setters[name] = (value: number) =>
							gl.uniform1f(location, value)
						break
					case WebGLRenderingContext.INT:
						setters[name] = (value: number) =>
							gl.uniform1f(location, value)
						break
					case WebGLRenderingContext.BOOL:
						setters[name] = (value: number) =>
							gl.uniform1f(location, value)
						break

					case WebGLRenderingContext.FLOAT_VEC2:
						setters[name] = (value: [number, number]) =>
							gl.uniform2fv(location, value)
						break
					case WebGLRenderingContext.FLOAT_VEC3:
						setters[name] = (value: [number, number, number]) =>
							gl.uniform3fv(location, value)
						break
					case WebGLRenderingContext.FLOAT_VEC4:
						setters[name] = (
							value: [number, number, number, number],
						) => gl.uniform4fv(location, value)
						break

					case WebGLRenderingContext.INT_VEC2:
						setters[name] = (value: [number, number]) =>
							gl.uniform2iv(location, value)
						break
					case WebGLRenderingContext.INT_VEC3:
						setters[name] = (value: [number, number, number]) =>
							gl.uniform3iv(location, value)
						break
					case WebGLRenderingContext.INT_VEC4:
						setters[name] = (
							value: [number, number, number, number],
						) => gl.uniform4iv(location, value)
						break

					case WebGLRenderingContext.FLOAT_MAT2:
						matrix[name] = (value: Float32Array) =>
							gl.uniformMatrix2fv(location, false, value)
						break
					case WebGLRenderingContext.FLOAT_MAT3:
						matrix[name] = (value: Float32Array) =>
							gl.uniformMatrix3fv(location, false, value)
						break
					case WebGLRenderingContext.FLOAT_MAT4:
						matrix[name] = (value: Float32Array) =>
							gl.uniformMatrix4fv(location, false, value)
						break

					// Текстуры (в v передаем номер текстурного юнита: 0, 1, 2...)
					// case WebGLRenderingContext.SAMPLER_2D:
					// 	matrix[name] = (value: unknown) =>
					// 		gl.uniform1i(location, value)
					// 	break
					// case WebGLRenderingContext.SAMPLER_CUBE:
					// 	matrix[name] = (value: unknown) =>
					// 		gl.uniform1i(location, value)
					// 	break
				}
			}
		}
	}
}
