import { create } from 'zustand'

import { createEmitter } from '@/modules/emitter'

import type { LineSettings, LineSimpleState } from './line-simple-panel.types'

export const createLine = (line?: Partial<LineSettings>): LineSettings => {
	return Object.assign(
		{
			point1: {
				x: 50,
				y: 50,
			},
			point2: {
				x: 100,
				y: 50,
			},
			point3: {
				x: 80,
				y: 100,
			},
			cap: 'butt',
			join: 'round',
			miterLimit: 1.2,
			roundLimit: 0,
		},
		line,
	)
}

export const useLineSimpleStore = create<LineSimpleState>((set, get) => {
	const onChangeItem = (callback: (item: LineSettings) => void) => {
		set(({ line }) => {
			callback(line)

			return {
				line: { ...line },
			}
		})
	}

	return {
		emitter: createEmitter(),

		line: createLine(),

		onChangeLine(value) {
			const { emitter } = get()
			set(() => {
				return {
					line: value,
				}
			})

			emitter.emit('onChangeLine', value)
		},

		onChangeX1(value) {
			onChangeItem((item) => {
				item.point1.x = value
			})
		},
		onChangeY1(value) {
			onChangeItem((item) => {
				item.point1.y = value
			})
		},
		onChangeX2(value) {
			onChangeItem((item) => {
				item.point2.x = value
			})
		},
		onChangeY2(value) {
			onChangeItem((item) => {
				item.point2.y = value
			})
		},
		onChangeX3(value) {
			onChangeItem((item) => {
				item.point3.x = value
			})
		},
		onChangeY3(value) {
			onChangeItem((item) => {
				item.point3.y = value
			})
		},

		onChangeCap(value) {
			onChangeItem((item) => {
				item.cap = value
			})
		},
		onChangeJoin(value) {
			onChangeItem((item) => {
				item.join = value
			})
		},
		onChangeMitterLimit(miterLimit: number) {
			onChangeItem((item) => {
				item.miterLimit = miterLimit
			})
		},
		onChangeRoundLimit(roundLimit: number) {
			onChangeItem((item) => {
				item.roundLimit = roundLimit
			})
		},

		onApply() {
			const { emitter, line } = get()
			emitter.emit('onChangeLine', line)
		},
	}
})
