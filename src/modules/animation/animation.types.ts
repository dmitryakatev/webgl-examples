export type Callback = () => void

export type AnimateOptions = {
	duration: number

	onStart: Callback
	onFrame: (progress: number) => void
	onEnd: Callback
}
