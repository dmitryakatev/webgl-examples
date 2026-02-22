export type DraggableOptions = {
	target: HTMLElement
	tolerance?: number
}

export type Position = {
	x: number
	y: number
}

export type DraggableEvent = {
	point: Position
}

export type DraggableEvents = {
	start: (event: DraggableEvent) => void
	drag: (event: DraggableEvent) => void
	end: (event: DraggableEvent) => void
}
