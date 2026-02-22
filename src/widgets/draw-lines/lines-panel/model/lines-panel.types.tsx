import type { Emitter } from '@/modules/emitter'

export type LinesSettingsEvents = {
	onChangeLine(index: number, line: LineSettings): void
}

export type LinesSettingsState = {
	emitter: Emitter<LinesSettingsEvents>
	lines: LineSettings[]
	onChangeJoin: (index: number, value: Join) => void
	onChangeCap: (index: number, value: Cap) => void
	onChangeMitterLimit: (index: number, miterLimit: number) => void
	onChangeRoundLimit: (index: number, roundLimit: number) => void
}

type Join = 'miter' | 'round'
type Cap = 'butt' | 'round'
export type Point = {
	x: number
	y: number
}

export type LineSettings = {
	id: number
	data: Point[]
	join: 'miter' | 'round'
	cap: 'butt' | 'round'
	miterLimit: number
	roundLimit: number
}
