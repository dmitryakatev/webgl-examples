import { mat4 } from 'gl-matrix'

import { Camera } from '@/modules/camera'
import { Buffer } from '@/modules/webgl'
import { updateSize } from '@/modules/webgl/utils'

import { RectProgram } from './rects-program'
import { bufferFactory } from './strcut-rect'

export class WebglApp {
	private $canvas: HTMLCanvasElement
	private gl: WebGLRenderingContext
	private camera: Camera

	private buffer: Buffer
	private program: RectProgram

	private renderId: number | null
	private size: {
		width: number
		height: number
	}

	constructor($canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		this.$canvas = $canvas
		this.gl = gl

		this.buffer = bufferFactory.create(gl)
		this.program = new RectProgram(gl)

		this.size = updateSize($canvas)
		this.renderId = null

		this.camera = new Camera({
			target: $canvas,
		})

		this.camera.on('change', () => {
			this.render()
		})
	}

	public render() {
		if (this.renderId === null) {
			this.renderId = window.requestAnimationFrame(() => {
				this.renderId = null
				this.draw()
			})
		}
	}

	public bindData(arrayBuffer: ArrayBuffer, count: number): void {
		// записываем в буфер данные
		this.buffer.setData(arrayBuffer, count, true)
	}

	private draw(): void {
		const { program, gl, size } = this
		const { width, height } = size

		// матрица трансформаций
		const transformMatrix = mat4.create()
		mat4.ortho(transformMatrix, 0, width, height, 0, -1, 1)
		mat4.multiply(
			transformMatrix,
			transformMatrix,
			this.camera.transformMatrix,
		)

		// переключаемся на программу
		program.useProgram()

		// чистим экран
		gl.viewport(0, 0, width, height)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// передаем в программу массив треугольников
		program.setBuffer(this.buffer)

		// записываем матрицу преобразований
		program.setMatrices({
			u_Transform: transformMatrix,
		})

		// рисуем треугольники
		gl.drawArrays(gl.TRIANGLES, 0, this.buffer.count)
	}
}
