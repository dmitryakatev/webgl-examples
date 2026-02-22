import type { AnimateOptions, Callback } from './animation.types'

export class Animation {
	private endCb: Callback | null = null
	private id: number | null = null

	public animate(options: AnimateOptions): void {
		const { duration, onStart, onFrame, onEnd } = options
		const start = performance.now()

		const run = () => {
			this.id = requestAnimationFrame((time) => {
				const progress = Math.min((time - start) / duration, 1)

				if (progress > 0) {
					onFrame(progress)
				}

				if (progress < 1) {
					run()
				} else {
					this.stop()
				}
			})
		}

		this.stop()

		if (duration === 0) {
			onStart()
			onFrame(1)
			onEnd()
			return
		}

		this.endCb = onEnd

		onStart()
		run()
	}

	private stop(): void {
		if (this.id !== null) {
			cancelAnimationFrame(this.id)
			this.id = null
		}

		if (this.endCb) {
			this.endCb()
			this.endCb = null
		}
	}
}
