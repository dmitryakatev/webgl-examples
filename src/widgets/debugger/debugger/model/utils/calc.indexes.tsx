import { UnpackArray } from '../unpack-array'

import type { IndexValue } from '../drawer.types'

export const calcIndexes = (
	indexesBuffer: ArrayBuffer,
	mode: number,
	type: number,
	offset: number,
	count: number,
): IndexValue[] => {
	const stride = UnpackArray.getSize(type)
	const start = Math.round(offset / stride)
	const size = Math.round(indexesBuffer.byteLength / stride)
	const ln = Math.min(size, count)

	const indexes = new UnpackArray(indexesBuffer, {
		index: {
			size: 1,
			type,
			stride,
			offset: 0,
		},
	})

	switch (mode) {
		case WebGLRenderingContext.TRIANGLES:
			return calcIndexesByTriangles(indexes, start, ln)
		case WebGLRenderingContext.TRIANGLE_STRIP:
			return calcIndexesByTriangleStrip(indexes, start, ln)
		case WebGLRenderingContext.TRIANGLE_FAN:
			return calcIndexesByTriangleFan(indexes, start, ln)
	}

	return []
}

const calcIndexesByTriangles = (
	indexes: UnpackArray,
	start: number,
	end: number,
): IndexValue[] => {
	const result: IndexValue[] = []

	for (let i = start; i < end; i += 3) {
		const i1 = indexes.unpack(i).index as number
		const i2 = indexes.unpack(i + 1).index as number
		const i3 = indexes.unpack(i + 2).index as number

		result.push({
			indexes: [i1, i2, i3],
		})
	}

	return result
}

const calcIndexesByTriangleStrip = (
	indexes: UnpackArray,
	start: number,
	end: number,
): IndexValue[] => {
	const result: IndexValue[] = []

	let i1 = indexes.unpack(start).index as number
	let i2 = indexes.unpack(start + 1).index as number
	let i3: number = 0

	for (let i = start + 2; i < end; ++i) {
		i3 = indexes.unpack(start).index as number
		result.push({
			indexes: [i1, i2, i3],
		})

		i1 = i2
		i2 = i3
	}

	return result
}

const calcIndexesByTriangleFan = (
	indexes: UnpackArray,
	start: number,
	end: number,
): IndexValue[] => {
	const result: IndexValue[] = []

	const i1 = indexes.unpack(start).index as number
	let i2 = indexes.unpack(start + 1).index as number
	let i3: number = 0

	for (let i = start + 2; i < end; ++i) {
		i3 = indexes.unpack(start).index as number
		result.push({
			indexes: [i1, i2, i3],
		})

		i2 = i3
	}

	return result
}
