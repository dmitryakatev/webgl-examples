import { Evented } from '../emitter'

import type {
	DraggableOptions,
	DraggableEvent,
	Position,
	DraggableEvents,
} from './draggable.types'

export class Draggable extends Evented<DraggableEvents> {
	private target: HTMLElement | null
	private tolerance: number
	private position: Position
	private moved = false

	constructor(options: DraggableOptions) {
		super()

		this.target = options.target
		this.tolerance = options.tolerance ?? 2
		this.position = {
			x: 0,
			y: 0,
		}

		this.onMouseDown = this.onMouseDown.bind(this)
		this.onMouseMove = this.onMouseMove.bind(this)
		this.onMouseUp = this.onMouseUp.bind(this)

		options.target.addEventListener('pointerdown', this.onMouseDown)
	}

	public destroy() {
		if (this.target) {
			this.target.removeEventListener('pointerdown', this.onMouseDown)
			this.target = null
		}
	}

	public onMouseDown(event: PointerEvent): void {
		this.addEvents()

		this.position = {
			x: event.clientX,
			y: event.clientY,
		}

		this.moved = false
	}

	private addEvents() {
		window.addEventListener('pointermove', this.onMouseMove)
		window.addEventListener('pointerup', this.onMouseUp)
		window.addEventListener('pointercancel', this.onMouseUp)
	}

	private removeEvents() {
		window.removeEventListener('pointermove', this.onMouseMove)
		window.removeEventListener('pointerup', this.onMouseUp)
		window.removeEventListener('pointercancel', this.onMouseUp)
	}

	private onMouseMove(event: PointerEvent): void {
		const drag = this.getDraggableEvent(event)

		if (!this.moved) {
			const { x, y } = drag.point
			const { tolerance } = this

			if (Math.abs(x) < tolerance && Math.abs(y) < tolerance) {
				return
			}

			this.moved = true

			const start = this.getDraggableEvent(this.position)
			this.emit('start', start)
		}

		this.emit('drag', drag)
	}

	private onMouseUp(event: PointerEvent): void {
		this.removeEvents()

		if (this.moved) {
			this.moved = false

			const end = this.getDraggableEvent(event)
			this.emit('end', end)
		}
	}

	private getDraggableEvent(position: Position): DraggableEvent {
		const { x, y } = this.position
		const point = {
			x: position.x - x,
			y: position.y - y,
		}

		return {
			point,
		}
	}
}
