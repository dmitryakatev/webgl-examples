import { create } from 'zustand'

import { createEmitter } from '@/modules/emitter'

import type { LineSettings, LinesSettingsState } from './lines-panel.types'

export const useLinesSettingsStore = create<LinesSettingsState>((set) => {
	const onChangeItem = (
		id: number,
		callback: (item: LineSettings) => void,
	) => {
		set(({ emitter, lines }) => {
			const index = lines.findIndex((item) => item.id === id)

			if (index !== -1) {
				const line = lines[index]

				callback(line)

				lines[index] = {
					...line,
				}

				emitter.emit('onChangeLine', index, lines[index])

				return {
					lines: [...lines],
				}
			}

			return {}
		})
	}

	return {
		emitter: createEmitter(),

		lines: [
			{
				id: 1,
				data: [
					{
						x: 10,
						y: 10,
					},
					{
						x: 20,
						y: 120,
					},
				],
				cap: 'butt',
				join: 'round',
				miterLimit: 0,
				roundLimit: 0,
			},
			{
				id: 2,
				data: [
					{
						x: 60,
						y: 100,
					},
					{
						x: 100,
						y: 30,
					},
					{
						x: 150,
						y: 130,
					},
				],
				cap: 'round',
				join: 'miter',
				miterLimit: 0,
				roundLimit: 0,
			},
			{
				id: 3,
				data: [
					{
						x: 250,
						y: 250,
					},
					{
						x: 300,
						y: 100,
					},
					{
						x: 350,
						y: 400,
					},
					{
						x: 400,
						y: 100,
					},
					{
						x: 500,
						y: 100,
					},
				],
				cap: 'butt',
				join: 'miter',
				miterLimit: 0,
				roundLimit: 0,
			},
		],

		onChangeCap(index, value) {
			onChangeItem(index, (item) => {
				item.cap = value
			})
		},
		onChangeJoin(index, value) {
			onChangeItem(index, (item) => {
				item.join = value
			})
		},
		onChangeMitterLimit(index, miterLimit) {
			onChangeItem(index, (item) => {
				item.miterLimit = miterLimit
			})
		},
		onChangeRoundLimit(index, roundLimit) {
			onChangeItem(index, (item) => {
				item.roundLimit = roundLimit
			})
		},
	}
})
