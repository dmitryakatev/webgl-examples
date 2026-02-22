export type ScaleOptions = {
	target: HTMLElement
}

export type Position = {
	x: number
	y: number
}

export type ScaleEvent = {
	scale: number
	point: Position
}

export type ScaleEvents = {
	start: () => void
	change: (event: ScaleEvent) => void
	end: () => void
}
