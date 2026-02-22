import { create } from 'zustand'

import { getContext } from '@/modules/webgl'
import { useRectListStore } from '@/widgets/draw-rects/rect-list/model/rect-list.store'

import { COUNT_VERTEX, structArrayFactory } from './strcut-rect'
import { WebglApp } from './webgl-app'

import type { DrawRectsState, StructPointForRect } from './draw-rects.types'
import type { Struct } from '@/modules/struct-array'
import type { RectItem } from '@/widgets/draw-rects/rect-list/model/rect-list.types'

export const useDrawRectStore = create<DrawRectsState>(() => {
	const store = useRectListStore.getState()
	const structArray = structArrayFactory.create()
	let webglApp: WebglApp | null = null

	// const getRange = (
	// 	a: number,
	// 	b: number,
	// 	offset: number,
	// ): [start: number, end: number] => {
	// 	const diff = b - a
	// 	const half = diff / 2
	// 	const withOffset = half + offset
	// 	return [-withOffset, withOffset]
	// }

	const createVertexes = (item: RectItem): Struct<StructPointForRect>[] => {
		const { x1, y1, x2, y2, radius } = item
		// const [xS, xE] = getRange(x1, x2, item.offsetX)
		// const [yS, yE] = getRange(y1, y2, item.offsetY)

		// const [xS, xE] = [0, 100]
		// const [yS, yE] = [0, 100]

		const [xS, xE] = [-100, 100]
		const [yS, yE] = [-100, 100]

		return [
			// 3 координаты для первого треугольника
			{
				a_position: [x1, y1],
				a_offset: [xS, yS],
				a_radius: radius,
			},
			{
				a_position: [x2, y1],
				a_offset: [xE, yS],
				a_radius: radius,
			},
			{
				a_position: [x1, y2],
				a_offset: [xS, yE],
				a_radius: radius,
			},
			// 3 координаты для второго треугольника
			{
				a_position: [x2, y1],
				a_offset: [xE, yS],
				a_radius: radius,
			},
			{
				a_position: [x1, y2],
				a_offset: [xS, yE],
				a_radius: radius,
			},
			{
				a_position: [x2, y2],
				a_offset: [xE, xE],
				a_radius: radius,
			},
		]
	}

	const onAdd = (item: RectItem) => {
		const vertexes = createVertexes(item)
		const ln = vertexes.length

		for (let i = 0; i < ln; ++i) {
			structArray.push(vertexes[i])
		}

		onBindData()
		onRedraw()
	}

	const onEdit = (index: number, item: RectItem) => {
		const idx = index * COUNT_VERTEX
		const vertexes = createVertexes(item)
		const ln = vertexes.length

		for (let i = 0; i < ln; ++i) {
			structArray.set(idx + i, vertexes[i])
		}

		onBindData()
		onRedraw()
	}

	const onDel = (index: number) => {
		structArray.splice(index, COUNT_VERTEX)

		onBindData()
		onRedraw()
	}

	const onBindData = () => {
		if (webglApp) {
			webglApp.bindData(structArray.serialize(), structArray.size)
		}
	}

	const onRedraw = () => {
		if (webglApp) {
			webglApp.render()
		}
	}

	store.emitter.on('onAdd', onAdd)
	store.emitter.on('onEdit', onEdit)
	store.emitter.on('onDel', onDel)

	const { list } = store
	for (const item of list) {
		onAdd(item)
	}

	return {
		setCanvas(canvas: HTMLCanvasElement) {
			const context = getContext(canvas)

			if (context) {
				webglApp = new WebglApp(canvas, context)

				onBindData()
				onRedraw()
			}
		},
	}
})
