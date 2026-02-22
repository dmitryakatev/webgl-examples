import { create } from 'zustand'

import { createEmitter } from '@/modules/emitter'

import type { RectListState } from './rect-list.types'

let id = 0

export const getId = () => {
	return ++id
}

export const useRectListStore = create<RectListState>((set) => ({
	emitter: createEmitter(),

	list: [
		{
			id: getId(),
			x1: 0,
			y1: 0,
			x2: 200,
			y2: 200,
			offsetX: 0,
			offsetY: 0,
			radius: 50,
		},
		{
			id: getId(),
			x1: 600,
			y1: 0,
			x2: 800,
			y2: 200,
			offsetX: 0,
			offsetY: 0,
			radius: 50,
		},
		{
			id: getId(),
			x1: 0,
			y1: 600,
			x2: 200,
			y2: 800,
			offsetX: 0,
			offsetY: 0,
			radius: 50,
		},
		{
			id: getId(),
			x1: 600,
			y1: 600,
			x2: 800,
			y2: 800,
			offsetX: 0,
			offsetY: 0,
			radius: 50,
		},
		{
			id: getId(),
			x1: 300,
			y1: 300,
			x2: 500,
			y2: 500,
			offsetX: 0,
			offsetY: 0,
			radius: 50,
		},
	],

	add(item) {
		set(({ emitter, list }) => {
			emitter.emit('onAdd', item)

			return {
				list: [...list, item],
			}
		})
	},
	remove: (item) => {
		set(({ emitter, list }) => {
			const index = list.indexOf(item)
			if (index !== -1) {
				emitter.emit('onDel', index)
				list = list.filter((el) => el !== item)
			}

			return {
				list,
			}
		})
	},
	onChange: (id, name, value) => {
		set(({ emitter, list }) => {
			const index = list.findIndex((el) => el.id === id)

			if (index !== -1) {
				const item = {
					...list[index],
					[name]: value,
				}

				emitter.emit('onEdit', index, item)
				list = [...list]
				list[index] = item
			}

			return {
				list,
			}
		})
	},
}))
