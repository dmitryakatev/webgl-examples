import RBush from 'rbush'

import { calcIndexes } from './utils/calc.indexes'
import { calcVertex } from './utils/calc.vertex'
import { rasterizeTriangle } from './utils/rasterize'
import { extendsBBox, getBBoxByTriangle, getLocalCoord } from './utils/utils'

import type {
	TriangleMeta,
	BufferDrawed,
	Rect,
	DrawOptions,
	DrawerType,
	BBoxItem,
	Logger,
} from './drawer.types'
import type { FragmentShaderFn, UniformValues } from './emulator.types'

export class CanvasDrawer {
	private _canvas: HTMLCanvasElement | null
	private _ctx: CanvasRenderingContext2D | null
	private _logger: Logger | null

	private _rasterizeCanvas: HTMLCanvasElement
	private _rasterizeCtx: CanvasRenderingContext2D

	private _buffersDrawed: BufferDrawed[]
	private _rbush: RBush<BBoxItem>
	private _rect: Rect

	private _selectedBufferIndex: number | null
	private _selectedVertexIndex: number | null
	private _selectedTriangleIndex: number | null

	constructor() {
		this._canvas = null
		this._ctx = null
		this._logger = null

		this._rasterizeCanvas = document.createElement('canvas')
		this._rasterizeCtx = this._rasterizeCanvas.getContext(
			'2d',
		) as CanvasRenderingContext2D

		this._buffersDrawed = []
		this._rbush = new RBush()
		this._rect = {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		}

		this._selectedBufferIndex = null
		this._selectedVertexIndex = null
		this._selectedTriangleIndex = null

		this.onClickCanvas = this.onClickCanvas.bind(this)
	}

	public __connect(
		canvas: HTMLCanvasElement,
		ctx: CanvasRenderingContext2D,
		logger: Logger,
	): void {
		this._canvas = canvas
		this._ctx = ctx
		this._logger = logger

		this._canvas.addEventListener('click', this.onClickCanvas)
		logger.clear()

		for (const item of this._buffersDrawed) {
			this.prepareBuffer(item)
			this.drawItem(ctx, item)

			logger.add(item)
		}
	}

	public __disconnect(): void {
		if (this._canvas) {
			this._canvas.removeEventListener('click', this.onClickCanvas)
		}

		this._canvas = null
		this._ctx = null

		this._rbush.clear()
		for (const item of this._buffersDrawed) {
			this.clearPrepareBuffer(item)
		}
	}

	private redraw(): void {
		const ctx = this._ctx

		if (!ctx) {
			return
		}

		this.clearDraw()
		for (const item of this._buffersDrawed) {
			this.drawItem(ctx, item)
		}

		this.drawSelected()
	}

	private drawSelected(): void {
		if (this._selectedBufferIndex == null) {
			return
		}

		if (this._selectedVertexIndex !== null) {
			this.drawSelectedVertex(
				this._selectedBufferIndex,
				this._selectedVertexIndex,
			)
			return
		}

		if (this._selectedTriangleIndex !== null) {
			this.drawSelectedTriangle(
				this._selectedBufferIndex,
				this._selectedTriangleIndex,
			)
			return
		}

		this.drawSelectedBuffer(this._selectedBufferIndex)
	}

	private drawSelectedBuffer(bufferIndex: number): void {
		const ctx = this._ctx

		if (ctx) {
			const { bBox } = this._buffersDrawed[bufferIndex]
			const { minX, minY, maxX, maxY } = bBox

			ctx.strokeStyle = 'blue'
			ctx.lineWidth = 1

			ctx.strokeRect(minX, minY, maxX - minX, maxY - minY)
		}
	}

	private drawSelectedVertex(bufferIndex: number, vertexIndex: number): void {
		const ctx = this._ctx

		if (ctx) {
			const buffer = this._buffersDrawed[bufferIndex]
			const vertex = buffer.vertexes[vertexIndex]
			const x = Math.round(vertex.screenPos.x)
			const y = Math.round(vertex.screenPos.y)

			ctx.strokeStyle = 'blue'
			ctx.lineWidth = 1

			ctx.beginPath()
			ctx.arc(x, y, 5, 0, Math.PI * 2)
			ctx.stroke()
		}
	}

	private drawSelectedTriangle(
		bufferIndex: number,
		triangleIndex: number,
	): void {
		console.log(bufferIndex, triangleIndex)
	}

	public selectBuffer(bufferIndex: number): void {
		this.resetSelect()
		this._selectedBufferIndex = bufferIndex
		this.redraw()
	}

	public selectVertex(bufferIndex: number, vertexIndex: number): void {
		this.resetSelect()
		this._selectedBufferIndex = bufferIndex
		this._selectedVertexIndex = vertexIndex
		this.redraw()
	}

	public selectTriangle(bufferIndex: number, triangleIndex: number): void {
		this.resetSelect()
		this._selectedBufferIndex = bufferIndex
		this._selectedTriangleIndex = triangleIndex
		this.redraw()
	}

	public clearSelect(): void {
		this.resetSelect()
		this.redraw()
	}

	private resetSelect(): void {
		this._selectedBufferIndex = null
		this._selectedVertexIndex = null
		this._selectedTriangleIndex = null
	}

	private onClickCanvas(e: MouseEvent): void {
		const ctx = this._ctx
		if (!ctx) {
			return
		}

		const { x, y } = getLocalCoord(e)
		const result = this._rbush.search({
			minX: x,
			minY: y,
			maxX: x,
			maxY: y,
		})

		for (let i = result.length - 1; i >= 0; --i) {
			const { bufferIndex, triangleIndex } = result[i]
			const bufferMeta = this._buffersDrawed[bufferIndex]
			const triangle = bufferMeta.triangles[triangleIndex]

			if (ctx.isPointInPath(triangle.path, x, y)) {
				const { fragment, uniforms } = bufferMeta
				this.rasterizeTriangle(ctx, fragment, uniforms, triangle)
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

	public clearDraw(): void {
		const ctx = this._ctx
		if (ctx) {
			const { x, y, width, height } = this._rect
			ctx.clearRect(x, y, width, height)
		}
	}

	public clear(): void {
		this._buffersDrawed = []
		this._rbush.clear()

		this.resetSelect()
		this.clearDraw()

		const logger = this._logger
		if (logger) {
			logger.clear()
		}
	}

	public drawBuffer(type: DrawerType, options: DrawOptions): void {
		const index = this._buffersDrawed.length
		const item: BufferDrawed = {
			type,
			index,
			options,

			fragment: options.program.fragment,
			uniforms: options.uniforms,

			triangles: [],
			vertexes: [],
			bBox: {
				minX: Infinity,
				minY: Infinity,
				maxX: -Infinity,
				maxY: -Infinity,
			},
		}

		this._buffersDrawed.push(item)

		const ctx = this._ctx
		if (ctx) {
			this.prepareBuffer(item)
			this.drawItem(ctx, item)
		}

		const logger = this._logger
		if (logger) {
			logger.add(item)
		}
	}

	private prepareBuffer(item: BufferDrawed): void {
		const {
			mode,
			type,
			offset,
			count,
			program,
			vertexBuffer,
			indexesBuffer,
			attributes,
			uniforms,
		} = item.options

		const vertexValues = calcVertex(
			program,
			vertexBuffer,
			attributes,
			uniforms,
			this._rect,
		)

		const indexValues = calcIndexes(
			indexesBuffer,
			mode,
			type,
			offset,
			count,
		)

		const tree = this._rbush
		const { triangles, vertexes, bBox } = item

		for (const vertex of vertexValues) {
			vertexes.push(vertex)
			extendsBBox(bBox, vertex.screenPos)
		}

		for (const {
			indexes: [i1, i2, i3],
		} of indexValues) {
			const v1 = vertexValues[i1]
			const v2 = vertexValues[i2]
			const v3 = vertexValues[i3]

			const bBox = getBBoxByTriangle(v1, v2, v3)
			const index = triangles.length

			const path = new Path2D()
			path.moveTo(v1.screenPos.x, v1.screenPos.y)
			path.lineTo(v2.screenPos.x, v2.screenPos.y)
			path.lineTo(v3.screenPos.x, v3.screenPos.y)
			path.lineTo(v1.screenPos.x, v1.screenPos.y)
			path.closePath()

			triangles.push({
				path,
				index,
				bBox,
				v1,
				v2,
				v3,
			})

			tree.insert({
				bufferIndex: item.index,
				triangleIndex: index,
				minX: bBox.minX,
				minY: bBox.minY,
				maxX: bBox.maxX,
				maxY: bBox.maxY,
			})
		}
	}

	private clearPrepareBuffer(item: BufferDrawed): void {
		item.triangles = []
	}

	private drawItem(ctx: CanvasRenderingContext2D, item: BufferDrawed): void {
		ctx.strokeStyle = 'black'
		ctx.lineWidth = 1

		for (const { path } of item.triangles) {
			ctx.stroke(path)
		}
	}

	private rasterizeTriangle(
		ctx: CanvasRenderingContext2D,
		fragment: FragmentShaderFn,
		uniforms: UniformValues,
		triangle: TriangleMeta,
	): void {
		const rasterizeCanvas = this._rasterizeCanvas
		const rasterizeCtx = this._rasterizeCtx
		const rect = this._rect
		const { width, height } = rect
		const { bBox, v1, v2, v3 } = triangle

		this.refreshRasterizeCanvas(width, height)

		const imageData = rasterizeCtx.createImageData(width, height)
		const data = new Uint32Array(imageData.data.buffer)

		rasterizeTriangle(data, rect, bBox, v1, v2, v3, fragment, uniforms)

		rasterizeCtx.putImageData(imageData, 0, 0)
		ctx.drawImage(rasterizeCanvas, 0, 0)
	}

	private refreshRasterizeCanvas(
		nextWidth: number,
		nextHeight: number,
	): void {
		const { width, height } = this._rasterizeCanvas

		if (width !== nextWidth) {
			this._rasterizeCanvas.width = nextWidth
		}

		if (height !== nextHeight) {
			this._rasterizeCanvas.height = nextHeight
		}
	}
}
