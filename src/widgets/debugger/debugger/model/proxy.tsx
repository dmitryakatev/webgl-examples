import type { Any } from './debugger.types'
import type { WebGLEmulatorContext } from './emulator'

export const createProxy = (
	original: WebGLRenderingContext,
	emulator: WebGLEmulatorContext,
) => {
	const proxy: Record<string, (...args: Any[]) => Any> = {
		createShader(type: number): WebGLShader | null {
			const shader = original.createShader(type)
			emulator.createShader(type, shader)
			return shader
		},
		shaderSource(shader: WebGLShader, source: string): void {
			original.shaderSource(shader, source)
			emulator.shaderSource(shader, source)
		},
		compileShader(shader: WebGLShader): void {
			original.compileShader(shader)
			emulator.compileShader(shader)
		},
		deleteShader(shader: WebGLShader | null): void {
			original.deleteShader(shader)
			emulator.deleteShader(shader)
		},

		createProgram(): WebGLProgram {
			const program = original.createProgram()
			emulator.createProgram(program)
			return program
		},
		attachShader(program: WebGLProgram, shader: WebGLShader): void {
			original.attachShader(program, shader)
			emulator.attachShader(program, shader)
		},
		linkProgram(program: WebGLProgram): void {
			original.linkProgram(program)
			emulator.linkProgram(program)
		},
		deleteProgram(program: WebGLProgram | null): void {
			original.deleteProgram(program)
			emulator.deleteProgram(program)
		},

		getAttribLocation(program: WebGLProgram, name: string): number {
			const location = original.getAttribLocation(program, name)
			emulator.getAttribLocation(program, name, location)
			return location
		},
		getUniformLocation(
			program: WebGLProgram,
			name: string,
		): WebGLUniformLocation | null {
			const location = original.getUniformLocation(program, name)
			emulator.getUniformLocation(program, name, location)
			return location
		},

		uniform1f(location: WebGLUniformLocation | null, x: number): void {
			original.uniform1f(location, x)
			emulator.uniform1f(location, x)
		},
		uniform2fv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform2fv(location, v)
			emulator.uniform2fv(location, v)
		},
		uniform3fv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform3fv(location, v)
			emulator.uniform3fv(location, v)
		},
		uniform4fv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform4fv(location, v)
			emulator.uniform4fv(location, v)
		},
		uniform2iv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform2iv(location, v)
			emulator.uniform2iv(location, v)
		},
		uniform3iv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform3iv(location, v)
			emulator.uniform3iv(location, v)
		},
		uniform4iv(location: WebGLUniformLocation | null, v: number[]): void {
			original.uniform4iv(location, v)
			emulator.uniform4iv(location, v)
		},

		uniformMatrix2fv(
			location: WebGLUniformLocation | null,
			transpose: boolean,
			value: number[],
		): void {
			original.uniformMatrix2fv(location, transpose, value)
			emulator.uniformMatrix2fv(location, transpose, value)
		},
		uniformMatrix3fv(
			location: WebGLUniformLocation | null,
			transpose: boolean,
			value: number[],
		): void {
			original.uniformMatrix3fv(location, transpose, value)
			emulator.uniformMatrix3fv(location, transpose, value)
		},
		uniformMatrix4fv(
			location: WebGLUniformLocation | null,
			transpose: boolean,
			value: number[],
		): void {
			original.uniformMatrix4fv(location, transpose, value)
			emulator.uniformMatrix4fv(location, transpose, value)
		},

		viewport(x: number, y: number, width: number, height: number): void {
			original.viewport(x, y, width, height)
			emulator.viewport(x, y, width, height)
		},
		clear(mask: number): void {
			original.clear(mask)
			emulator.clear(mask)
		},

		bindBuffer(target: number, buffer: WebGLBuffer | null): void {
			original.bindBuffer(target, buffer)
			emulator.bindBuffer(target, buffer)
		},
		bufferData(
			target: number,
			data: AllowSharedBufferSource | null,
			usage: GLenum,
		): void {
			original.bufferData(target, data, usage)
			emulator.bufferData(target, data, usage)
		},
		deleteBuffer(buffer: WebGLBuffer | null): void {
			original.deleteBuffer(buffer)
			emulator.deleteBuffer(buffer)
		},
		vertexAttribPointer(
			index: number,
			size: number,
			type: number,
			normalized: boolean,
			stride: number,
			offset: number,
		): void {
			original.vertexAttribPointer(
				index,
				size,
				type,
				normalized,
				stride,
				offset,
			)
			emulator.vertexAttribPointer(
				index,
				size,
				type,
				normalized,
				stride,
				offset,
			)
		},

		useProgram(program: WebGLProgram | null): void {
			original.useProgram(program)
			emulator.useProgram(program)
		},
		drawArrays(mode: number, first: number, count: number): void {
			original.drawArrays(mode, first, count)
			emulator.drawArrays(mode, first, count)
		},
		drawElements(
			mode: number,
			count: number,
			type: number,
			offset: number,
		): void {
			original.drawElements(mode, count, type, offset)
			emulator.drawElements(mode, count, type, offset)
		},
	}

	return new Proxy(original, {
		get(obj, prop, receiver) {
			const wrap = proxy[prop as string]
			if (wrap) {
				return wrap
			}

			const value = Reflect.get(obj, prop, receiver)
			if (typeof value === 'function') {
				return value.bind(obj)
			}

			return value
		},
		set(obj, prop, value) {
			return Reflect.set(obj, prop, value)
		},
	})
}
