import { createEmitter } from './emitter'

import type { Emitter, EmitterEvents } from './emitter.types'

export class Evented<T extends EmitterEvents> {
	private _emitter: Emitter<T>

	constructor() {
		this._emitter = createEmitter()
	}

	public on<E extends keyof T>(event: E, listener: T[E]) {
		this._emitter.on(event, listener)
	}

	public off<E extends keyof T>(event: E, listener: T[E]) {
		this._emitter.off(event, listener)
	}

	protected emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>) {
		this._emitter.emit(event, ...args)
	}
}
