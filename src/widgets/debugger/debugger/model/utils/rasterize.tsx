import type { Rect, Pos, VertexValue, BBox } from '../drawer.types'
import type {
	FragmentShaderFn,
	UniformValues,
	VarValue,
	VarValues,
} from '../emulator.types'

const calcBBoxByRect = (bBox: BBox, rect: Rect) => {
	return {
		minX: Math.max(bBox.minX, rect.x),
		maxX: Math.min(bBox.maxX, rect.width - 1),
		minY: Math.max(bBox.minY, rect.y),
		maxY: Math.min(bBox.maxY, rect.height - 1),
	}
}

// Вспомогательная функция для ориентированной площади треугольника
const edgeFunction = (
	ax: number,
	ay: number,
	bx: number,
	by: number,
	cx: number,
	cy: number,
) => {
	return (cx - ax) * (by - ay) - (cy - ay) * (bx - ax)
}

const getBarycentric = (px: number, py: number, p1: Pos, p2: Pos, p3: Pos) => {
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

const interpolate = (
	weights: number[],
	valA: VarValue,
	valB: VarValue,
	valC: VarValue,
) => {
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

const toHex = (value: number) => {
	return Math.round(Math.max(0, Math.min(1, value)) * 255)
}

const toHEXColor = (color: Float32Array): number => {
	const r = toHex(color[0])
	const g = toHex(color[1])
	const b = toHex(color[2])
	const a = toHex(color[3])

	return (a << 24) + (b << 16) + (g << 8) + r
}

export const rasterizeTriangle = (
	data: Uint32Array,
	rect: Rect,
	bBox: BBox,
	v1: VertexValue,
	v2: VertexValue,
	v3: VertexValue,
	fragment: FragmentShaderFn,
	uniforms: UniformValues,
): void => {
	const { minX, maxX, minY, maxY } = calcBBoxByRect(bBox, rect)
	const { width } = rect

	for (let y = minY; y <= maxY; y++) {
		for (let x = minX; x <= maxX; x++) {
			// ВАЖНО: проверяем точку (x + 0.5, y + 0.5) — это центр пикселя
			const weights = getBarycentric(
				x + 0.5,
				y + 0.5,
				v1.screenPos,
				v2.screenPos,
				v3.screenPos,
			)

			if (weights) {
				const vars: VarValues = {}
				const gl_FragCoord = new Float32Array([x + 0.5, y + 0.5, 0, 1])

				for (const key in v1.varyings) {
					vars[key] = interpolate(
						weights,
						v1.varyings[key],
						v2.varyings[key],
						v3.varyings[key],
					)
				}

				const glCol = fragment(uniforms, vars, gl_FragCoord)
				const color = toHEXColor(glCol)
				const index = y * width + x

				data[index] = color
			}
		}
	}
}
