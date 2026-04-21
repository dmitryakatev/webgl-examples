import type { Emitter } from '@/modules/emitter'

export type LineSimpleEvents = {
	onChangeLine(line: LineSettings): void
}

export type LineSimpleState = {
	emitter: Emitter<LineSimpleEvents>
	line: LineSettings
	onChangeLine: (line: LineSettings) => void
	onChangeX1: (x1: number) => void
	onChangeY1: (y1: number) => void
	onChangeX2: (x2: number) => void
	onChangeY2: (y2: number) => void
	onChangeX3: (x3: number) => void
	onChangeY3: (y3: number) => void
	onChangeJoin: (value: Join) => void
	onChangeCap: (value: Cap) => void
	onChangeMitterLimit: (miterLimit: number) => void
	onChangeRoundLimit: (roundLimit: number) => void
	onApply: () => void
}

type Join = 'miter' | 'round'
type Cap = 'butt' | 'round'
export type Point = {
	x: number
	y: number
}

export type LineSettings = {
	point1: Point
	point2: Point
	point3: Point
	join: 'miter' | 'round'
	cap: 'butt' | 'round'
	miterLimit: number
	roundLimit: number
}
