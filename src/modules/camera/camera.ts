import { mat4 } from 'gl-matrix'

import { Draggable } from '../draggable'
import { Evented } from '../emitter'
import { Scale } from '../scale'

import type {
	CameraOptions,
	CameraPosition,
	CameraEvents,
} from './camera.types'

export class Camera extends Evented<CameraEvents> {
	private _draggable: Draggable | null
	private _scale: Scale | null

	private _position: CameraPosition
	private _transformMatrix: mat4

	public get transformMatrix() {
		return this._transformMatrix
	}

	constructor(options: CameraOptions) {
		super()

		this._draggable = null
		this._scale = null

		this._transformMatrix = mat4.create()
		this._position = {
			x: 0,
			y: 0,
		}

		const enableScale = options.scale ?? true
		const enableDrag = options.drag ?? true

		if (enableScale) {
			this.createScale(options)
		}

		if (enableDrag) {
			this.createDraggable(options)
		}
	}

	private createScale(options: CameraOptions) {
		let position = {
			x: 0,
			y: 0,
		}

		const calcScalePosition = (
			position: number,
			localPoint: number,
			scale: number,
		) => {
			// расстояние между точкой над которой происходит зум
			// и глобальной позицией
			const distance = localPoint - position
			// в зависимости от масштаба увеличим или уменьшим нашу дистанцию
			const offset = distance * scale
			// тк мы зумируем относильно нашей точки, то вычтем полученный сдвиг
			// и получим новую глобальную позицию
			const result = localPoint - offset

			return result
		}

		this._scale = new Scale({
			target: options.target,
		})

		this._scale.on('start', () => {
			position = this._position
		})

		this._scale.on('change', ({ scale, point }) => {
			// тк мы масштабируем отностильно некой точки на экране
			// то у глобальной позиции происходит смещение
			// и нам нужно найти новые координаты позиции с учетом смещения
			const x = calcScalePosition(position.x, point.x, scale)
			const y = calcScalePosition(position.y, point.y, scale)

			this._position = {
				x,
				y,
			}

			this.onChangePosition()
		})
	}

	private createDraggable(options: CameraOptions): void {
		let position = {
			x: 0,
			y: 0,
		}

		this._draggable = new Draggable({
			target: options.target,
		})

		this._draggable.on('start', () => {
			position = this._position
		})

		this._draggable.on('drag', ({ point: { x, y } }) => {
			this._position = {
				x: position.x + x,
				y: position.y + y,
			}

			this.onChangePosition()
		})
	}

	private onChangePosition(): void {
		const m = mat4.create()

		if (this._draggable) {
			const { x, y } = this._position
			mat4.translate(m, m, [x, y, 0])
		}

		if (this._scale) {
			const scale = this._scale.value
			mat4.scale(m, m, [scale, scale, 1])
		}

		this._transformMatrix = m
		this.emit('change')
	}
}
