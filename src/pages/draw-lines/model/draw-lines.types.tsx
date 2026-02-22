import type { Buffer } from '@/modules/webgl'

export type DrawLinesState = {
	setCanvas(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): void
}

export type StructPointForLine = [['a_pos', 2], ['a_data', 2]]

export type LineBuffers = {
	vertex: Buffer
	indexes: Buffer
}
