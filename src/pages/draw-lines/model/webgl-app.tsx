import { mat4 } from 'gl-matrix'

import { Camera } from '@/modules/camera'
import { updateSize } from '@/modules/webgl/utils'

import {
	createLineArray,
	type LineTrianglesFactoryOptions,
} from './line-factory'
import { LineProgram } from './line-program'
import {
	bufferLineVertexFactory,
	bufferLineIndexesFactory,
} from './strcut-line'

import type { LineBuffers } from './draw-lines.types'

export class WebglApp {
	private gl: WebGLRenderingContext
	private camera: Camera

	private lines: LineBuffers[]
	private program: LineProgram

	private renderId: number | null
	private size: {
		width: number
		height: number
	}

	constructor($canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		this.gl = gl

		this.lines = []
		this.program = new LineProgram(gl)

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

	public addLine(): void {
		this.lines.push({
			vertex: bufferLineVertexFactory.create(this.gl),
			indexes: bufferLineIndexesFactory.create(this.gl),
		})
	}

	public refreshLine(
		index: number,
		options: LineTrianglesFactoryOptions,
	): void {
		const { vertex, indexes } = this.lines[index]
		const arrays = createLineArray(options)

		vertex.setData(arrays.vertex.serialize(), arrays.vertex.size)
		indexes.setData(arrays.indexes.serialize(), arrays.indexes.size)

		this.render()
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

		// записываем матрицу преобразований
		program.setMatrices({
			u_matrix: transformMatrix,
		})

		program.setUniforms({
			u_ratio: 2,
			u_line_width: 20,
			u_device_pixel_ratio: 2,
			u_color: [0.2, 0.3, 0.7, 1],
			u_opacity: 1,
		})

		// перебираем все треугольники
		for (const { vertex, indexes } of this.lines) {
			// передаем в программу массив треугольников
			program.setBuffer(vertex, indexes)
			// рисуем треугольники
			program.draw()
		}
	}
}
