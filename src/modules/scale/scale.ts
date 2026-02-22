import { Animation } from '@/modules/animation'

import { Evented } from '../emitter'

import type { ScaleOptions, Position, ScaleEvents } from './scale.types'

const WHEEL_ZOOM_DELTA = 4.000244140625
const MAX_SCALE_PER_FRAME = 2

const CONFIG = {
	wheel: {
		duration: 200,
		resistance: 150,
	},
	trackpad: {
		duration: 0,
		resistance: 250,
	},
}

export class Scale extends Evented<ScaleEvents> {
	private scale = 1
	private lastValue = 0
	private lastWheelTime = 0
	private timeout: number | null = null
	private type: 'wheel' | 'trackpad' | null = null
	private position: Position

	private animation: Animation

	public get value() {
		return this.scale
	}

	constructor(options: ScaleOptions) {
		super()

		this.animation = new Animation()
		this.position = {
			x: 0,
			y: 0,
		}

		this.onWheel = this.onWheel.bind(this)
		this.onTimeout = this.onTimeout.bind(this)

		options.target.addEventListener('wheel', this.onWheel)
	}

	private onWheel(e: WheelEvent): void {
		let value =
			e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaY * 40 : e.deltaY

		const now = Date.now()
		const timeDelta = now - this.lastWheelTime

		this.lastWheelTime = now
		this.position = this.getLocalCoord(e)

		if (value !== 0 && value % WHEEL_ZOOM_DELTA === 0) {
			this.type = 'wheel'
		} else if (value !== 0 && Math.abs(value) < 4) {
			this.type = 'trackpad'
		} else if (timeDelta > 400) {
			this.type = null
			this.lastValue = value

			this.timeout = window.setTimeout(this.onTimeout, 40)
		} else if (!this.type) {
			this.type = Math.abs(timeDelta * value) < 200 ? 'trackpad' : 'wheel'
			if (this.timeout !== null) {
				clearTimeout(this.timeout)

				this.timeout = null
				value += this.lastValue
			}
		}

		// Только если знаем тип события
		if (this.type) {
			this.animateScale(-value)
		}

		e.preventDefault()
	}

	private getLocalCoord(e: WheelEvent): Position {
		const el = e.currentTarget as HTMLElement
		const { top, left } = el.getBoundingClientRect()

		return {
			x: e.pageX - (left + window.scrollX),
			y: e.pageY - (top + window.scrollY),
		}
	}

	private onTimeout(): void {
		this.type = 'wheel'

		this.animateScale(-this.lastValue)
	}

	private animateScale(delta: number): void {
		if (delta === 0) {
			return
		}

		const { duration, resistance } = CONFIG[this.type ?? 'trackpad']

		let scale =
			MAX_SCALE_PER_FRAME / (1 + Math.exp(-Math.abs(delta / resistance)))

		if (delta < 0 && scale !== 0) {
			scale = 1 / scale
		}

		const currScale = this.scale
		const nextScale = currScale * scale

		this.animation.animate({
			duration,
			onStart: () => {
				this.emit('start')
			},
			onFrame: (percent) => {
				this.scale = (nextScale - currScale) * percent + currScale

				this.emit('change', {
					scale: this.scale / currScale,
					point: this.position,
				})
			},
			onEnd: () => {
				this.emit('end')
			},
		})
	}
}
