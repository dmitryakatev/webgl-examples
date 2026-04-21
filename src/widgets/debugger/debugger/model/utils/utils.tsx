import type { VertexValue, BBox, Pos } from '../drawer.types'

export const extendsBBox = (bBox: BBox, { x, y }: Pos): void => {
	const minX = Math.floor(x)
	const minY = Math.floor(y)
	const maxX = Math.ceil(x)
	const maxY = Math.ceil(y)

	if (minX < bBox.minX) {
		bBox.minX = minX
	}

	if (minY < bBox.minY) {
		bBox.minY = minY
	}

	if (maxX > bBox.maxX) {
		bBox.maxX = maxX
	}

	if (maxY > bBox.maxY) {
		bBox.maxY = maxY
	}
}

export const getBBoxByTriangle = (
	v1: VertexValue,
	v2: VertexValue,
	v3: VertexValue,
): BBox => {
	const v1x = v1.screenPos.x
	const v1y = v1.screenPos.y

	const v2x = v2.screenPos.x
	const v2y = v2.screenPos.y

	const v3x = v3.screenPos.x
	const v3y = v3.screenPos.y

	const minX = Math.floor(Math.min(v1x, v2x, v3x))
	const maxX = Math.ceil(Math.max(v1x, v2x, v3x))
	const minY = Math.floor(Math.min(v1y, v2y, v3y))
	const maxY = Math.ceil(Math.max(v1y, v2y, v3y))

	return {
		minX,
		maxX,
		minY,
		maxY,
	}
}

export const getLocalCoord = (e: MouseEvent) => {
	const el = e.currentTarget as HTMLElement
	const { top, left } = el.getBoundingClientRect()

	return {
		x: e.pageX - (left + window.scrollX),
		y: e.pageY - (top + window.scrollY),
	}
}
