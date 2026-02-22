export type CameraOptions = {
	target: HTMLElement
	scale?: boolean
	drag?: boolean
}

export type CameraPosition = {
	x: number
	y: number
}

export type CameraEvents = {
	change: () => void
}
