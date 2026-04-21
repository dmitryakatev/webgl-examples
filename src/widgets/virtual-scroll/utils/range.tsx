import { indexLeft } from './binary-search'

import type { RenderDataOptions, RenderDataResult } from './range.types'
import type { DynamicBlockSize } from '../virtual-scroll.types'

const stockRange = <T,>(
	start: number,
	finish: number,
	stock: number,
	size: number,
): RenderDataResult<T> => {
	const MIN = 0
	const MAX = size

	// делаем диапазон с запасом
	start -= stock
	finish += stock

	if (start < MIN) {
		start = MIN
	}

	if (finish > MAX) {
		finish = MAX
	}

	return {
		start, // с какой записи надо рендерить
		finish, // по какую запись надо рентерить
		contentSize: null, // размер контента
		dataSize: null, // размер блока с данными
		offset: null, // смещение
		data: [], //
	}
}

const findSimpleVisibleRange = <T,>(
	options: RenderDataOptions<T>,
): RenderDataResult<T> => {
	const pixelStart = options.scroll
	const pixelFinish = pixelStart + options.size
	const { data, blockSize, stock } = options

	const start = Math.ceil(pixelStart / blockSize)
	const finish = Math.floor(pixelFinish / blockSize)

	const range = stockRange<T>(start, finish, stock, data.length)

	range.contentSize = data.length * blockSize
	range.dataSize = (range.finish - range.start) * blockSize
	range.offset = range.start * blockSize

	return range
}

const findVisibleRangeWithDynamicSize = <T,>(
	options: RenderDataOptions<T>,
): RenderDataResult<T> => {
	const pixelStart = options.scroll
	const pixelFinish = pixelStart + options.size
	const { data, positions, stock } = options

	const start = indexLeft(positions, pixelStart)
	let finish = indexLeft(positions, pixelFinish)

	if (positions[finish] === pixelFinish) {
		++finish
	}

	const range = stockRange<T>(start, finish, stock, data.length)

	range.contentSize = positions[positions.length - 1]
	range.dataSize = positions[range.finish] - positions[range.start]
	range.offset = positions[range.start]

	return range
}

const findDisplayRange = <T,>(
	options: RenderDataOptions<T>,
): RenderDataResult<T> => {
	if (options.enable && options.data.length > options.autoDisable) {
		if (options.isDynamicSize) {
			return findVisibleRangeWithDynamicSize(options)
		}

		return findSimpleVisibleRange(options)
	}

	return stockRange<T>(
		-Infinity,
		Infinity,
		options.stock,
		options.data.length,
	)
}

const createArrayData = <T,>(
	original: T[],
	range: RenderDataResult<T>,
): RenderDataResult<T> => {
	const { start, finish, data } = range

	for (let i = start; i < finish; ++i) {
		data.push(original[i])
	}

	return range
}

export const updatePositionBlocks = <T,>(
	data: T[],
	blockSize: DynamicBlockSize<T>,
) => {
	let result: number[]
	let position = 0

	result = [position]
	data.forEach((item) => {
		position += blockSize(item)
		result.push(position)
	})

	return result
}

export const getRenderData = <T,>(
	options: RenderDataOptions<T>,
): RenderDataResult<T> =>
	createArrayData(options.data, findDisplayRange(options))
