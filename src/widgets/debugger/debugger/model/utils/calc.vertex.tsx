import { UnpackArray } from '../unpack-array'

import type { Rect, VertexValue } from '../drawer.types'
import type {
	AttributePointer,
	WebGLEmulatorProgram,
	UniformValues,
	VarValues,
} from '../emulator.types'

const ndcToScreen = (glPos: Float32Array, rect: Rect) => {
	const { width, height } = rect
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

export const calcVertex = (
	program: WebGLEmulatorProgram,
	vertexBuffer: ArrayBuffer,
	attributes: Record<string, AttributePointer>,
	uniforms: UniformValues,
	rect: Rect,
) => {
	const result: VertexValue[] = []
	const unpackVertex = new UnpackArray(vertexBuffer, attributes)
	const { stride } = Object.values(attributes)[0]
	const size = Math.round(vertexBuffer.byteLength / stride)

	const { vertex, varyings } = program

	for (let i = 0; i < size; ++i) {
		const attrs = unpackVertex.unpack(i)
		const vars: VarValues = {}

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
		const screenPos = ndcToScreen(glPos, rect)
		result.push({
			glPos,
			screenPos,
			varyings: vars,
		})
	}

	return result
}
