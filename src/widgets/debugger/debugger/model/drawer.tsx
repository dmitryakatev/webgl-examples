import { UnpackArray } from './unpack-array'

import type { AttributePointer, WebGLEmulatorProgram } from './emulator.types'

type Value = number | Float32Array
type VertexValue = {
	glPos: Float32Array
	screenPos: {
		x: number
		y: number
	}
	varyings: Record<string, Value>
}

type TriangleMeta = {
	path: Path2D
	v1: VertexValue
	v2: VertexValue
	v3: VertexValue
	fragment: any // TODO
	uniforms: Record<string, number | number[]>
}

type Pos = {
	x: number
	y: number
}

export class CanvasDrawer {
	private _canvas: HTMLCanvasElement | null
	private _ctx: CanvasRenderingContext2D | null
	private _triangles: TriangleMeta[]
	private _rect: {
		x: number
		y: number
		width: number
		height: number
	}

	constructor() {
		this._canvas = null
		this._ctx = null
		this._triangles = []
		this._rect = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		}

		this.onClickCanvas = this.onClickCanvas.bind(this)
	}

	public __connect(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
	): void {
		this._canvas = canvas
		this._ctx = ctx

		this._canvas.addEventListener('click', this.onClickCanvas)
	}

	public __disconnect(): void {
		if (this._canvas) {
			this._canvas.removeEventListener('click', this.onClickCanvas)
		}

		this._canvas = null
		this._ctx = null
	}

	private onClickCanvas(e: MouseEvent): void {
		const ctx = this._ctx
		if (!ctx) {
			return
		}

		const { x, y } = this.getLocalCoord(e)

		for (const triangle of this._triangles) {
			if (ctx.isPointInPath(triangle.path, x, y)) {
				this.rasterizeTriangle(ctx, triangle)
				return
			}
		}
	}

	public viewport(x: number, y: number, width: number, height: number): void {
		this._rect = {
			x,
			y,
			width,
			height,
		}
	}

	public clear(): void {
		this._triangles = []

		const ctx = this._ctx
		if (ctx) {
			const { x, y, width, height } = this._rect
			ctx.clearRect(x, y, width, height)
		}
	}

	public drawArrays(
		mode: number,
		first: number,
		count: number,
		program: WebGLEmulatorProgram,
		vertexBuffer: ArrayBuffer,
		attributes: Record<string, AttributePointer>,
		uniforms: Record<string, number | number[]>,
	): void {
		console.log(
			mode,
			first,
			count,
			program,
			vertexBuffer,
			attributes,
			uniforms,
		)
	}

	public drawElements(
		_mode: number,
		count: number,
		type: number,
		_offset: number,
		program: WebGLEmulatorProgram,
		vertexBuffer: ArrayBuffer,
		indexesBuffer: ArrayBuffer,
		attributes: Record<string, AttributePointer>,
		uniforms: Record<string, number | number[]>,
	): void {
		const ctx = this._ctx
		if (!ctx) {
			return
		}

		const vertexValues = this.calcVertex(
			program,
			vertexBuffer,
			attributes,
			uniforms,
		)
		const unpackIndexes = new UnpackArray(indexesBuffer, {
			index: {
				size: 3,
				type,
				stride: UnpackArray.getSize(type) * 3,
				offset: 0,
			},
		})

		ctx.strokeStyle = 'black'
		ctx.lineWidth = 1

		const { fragment } = program

		const size = Math.round(count / 3)
		for (let i = 0; i < size; ++i) {
			const idx = unpackIndexes.unpack(i)
			const [i1, i2, i3] = idx.index as number[]

			const v1 = vertexValues[i1]
			const v2 = vertexValues[i2]
			const v3 = vertexValues[i3]

			const trianglePath = new Path2D()
			trianglePath.moveTo(v1.screenPos.x, v1.screenPos.y)
			trianglePath.lineTo(v2.screenPos.x, v2.screenPos.y)
			trianglePath.lineTo(v3.screenPos.x, v3.screenPos.y)
			trianglePath.lineTo(v1.screenPos.x, v1.screenPos.y)
			trianglePath.closePath()
			ctx.stroke(trianglePath)

			this._triangles.push({
				path: trianglePath,
				v1,
				v2,
				v3,
				fragment,
				uniforms,
			})
		}

		// console.log(
		// 	mode,
		// 	count,
		// 	type,
		// 	offset,
		// 	program,
		// 	vertexBuffer,
		// 	indexesBuffer,
		// 	attributes,
		// 	uniforms,
		// )
	}

	private rasterizeTriangle(
		ctx: CanvasRenderingContext2D,
		triangle: TriangleMeta,
	): void {
		const { v1, v2, v3, uniforms, fragment } = triangle
		const rect = this._rect

		const minX = Math.floor(
			Math.min(v1.screenPos.x, v2.screenPos.x, v3.screenPos.x),
		)
		const maxX = Math.ceil(
			Math.max(v1.screenPos.x, v2.screenPos.x, v3.screenPos.x),
		)

		const minY = Math.floor(
			Math.min(v1.screenPos.y, v2.screenPos.y, v3.screenPos.y),
		)
		const maxY = Math.ceil(
			Math.max(v1.screenPos.y, v2.screenPos.y, v3.screenPos.y),
		)

		for (let y = minY; y <= maxY; y++) {
			for (let x = minX; x <= maxX; x++) {
				if (
					x < rect.x ||
					x > rect.width ||
					y < rect.y ||
					y > rect.height
				) {
					continue
				}

				// ВАЖНО: проверяем точку (x + 0.5, y + 0.5) — это центр пикселя
				const weights = this.getBarycentric(
					x + 0.5,
					y + 0.5,
					v1.screenPos,
					v2.screenPos,
					v3.screenPos,
				)

				if (weights) {
					const vars: Record<string, Value> = {}
					const gl_FragCoord = new Float32Array([
						x + 0.5,
						y + 0.5,
						0,
						1,
					])

					for (const key in v1.varyings) {
						vars[key] = this.interpolate(
							weights,
							v1.varyings[key],
							v2.varyings[key],
							v3.varyings[key],
						)
					}

					const glCol = fragment(uniforms, vars, gl_FragCoord)
					const color = this.toCanvasColor(glCol)

					ctx.fillStyle = color
					ctx.fillRect(x, y, 1, 1)
				}
			}
		}
	}

	private calcVertex(
		program: WebGLEmulatorProgram,
		vertexBuffer: ArrayBuffer,
		attributes: Record<string, AttributePointer>,
		uniforms: Record<string, number | number[]>,
	) {
		const result: VertexValue[] = []
		const unpackVertex = new UnpackArray(vertexBuffer, attributes)
		const { stride } = Object.values(attributes)[0]
		const size = Math.round(vertexBuffer.byteLength / stride)

		const { vertex, varyings } = program

		for (let i = 0; i < size; ++i) {
			const attrs = unpackVertex.unpack(i)
			const vars: Record<string, Value> = {}

			for (const name in varyings) {
				const count = varyings[name]

				switch (count) {
					case 1:
						vars[name] = 0
						break
					case 2:
						vars[name] = new Float32Array([0, 0])
						break
					case 3:
						vars[name] = new Float32Array([0, 0, 0])
						break
					case 4:
						vars[name] = new Float32Array([0, 0, 0, 0])
						break
				}
			}

			const glPos = vertex(attrs, uniforms, vars)
			const screenPos = this.ndcToScreen(glPos)
			result.push({
				glPos,
				screenPos,
				varyings: vars,
			})
		}

		return result
	}

	private ndcToScreen(glPos: Float32Array) {
		const { width, height } = this._rect
		// glPos это твой [x, y, z, w]
		// Сначала делаем Perspective Divide (деление на w)
		// В 2D это часто [x/w, y/w], если w не 1.0
		const x = glPos[0] / glPos[3]
		const y = glPos[1] / glPos[3]

		const screenX = (x + 1) * 0.5 * width
		// Инвертируем Y: (1 - (нормализованный_y)) * height
		const screenY = (1 - (y + 1) * 0.5) * height
		// Или проще: screenY = (1 - y) * 0.5 * height;

		return {
			x: screenX,
			y: screenY,
		}
	}

	private getLocalCoord(e: MouseEvent) {
		const el = e.currentTarget as HTMLElement
		const { top, left } = el.getBoundingClientRect()

		return {
			x: e.pageX - (left + window.scrollX),
			y: e.pageY - (top + window.scrollY),
		}
	}

	private getBarycentric(px: number, py: number, p1: Pos, p2: Pos, p3: Pos) {
		// Вспомогательная функция для ориентированной площади треугольника
		function edgeFunction(
			ax: number,
			ay: number,
			bx: number,
			by: number,
			cx: number,
			cy: number,
		) {
			return (cx - ax) * (by - ay) - (cy - ay) * (bx - ax)
		}

		const area = edgeFunction(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y)

		// Если площадь 0, треугольник вырожден в линию
		if (Math.abs(area) < 0.000001) return null

		const w1 = edgeFunction(p2.x, p2.y, p3.x, p3.y, px, py) / area
		const w2 = edgeFunction(p3.x, p3.y, p1.x, p1.y, px, py) / area
		const w3 = 1 - w1 - w2

		if (w1 >= 0 && w2 >= 0 && w3 >= 0) {
			return [w1, w2, w3]
		}
		return null
	}

	private interpolate(
		weights: number[],
		valA: Value,
		valB: Value,
		valC: Value,
	) {
		const [u, v, w] = weights

		// 1. Если это просто число (float)
		if (typeof valA === 'number') {
			return valA * u + (valB as number) * v + (valC as number) * w
		}

		return valA.map((_, i) => {
			return (
				valA[i] * u +
				(valB as Float32Array)[i] * v +
				(valC as Float32Array)[i] * w
			)
		})
	}

	private toCanvasColor(glVec4: Float32Array) {
		const r = Math.round(Math.max(0, Math.min(1, glVec4[0])) * 255)
		const g = Math.round(Math.max(0, Math.min(1, glVec4[1])) * 255)
		const b = Math.round(Math.max(0, Math.min(1, glVec4[2])) * 255)
		const a = glVec4[3] // Альфа в канвасе тоже от 0 до 1, её не множим на 255!

		return `rgba(${r}, ${g}, ${b}, ${a})`
	}
}
