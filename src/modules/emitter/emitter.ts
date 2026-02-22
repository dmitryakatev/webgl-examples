import type { EmitterEvents, StoreEvents } from './emitter.types'

export const createEmitter = <T extends EmitterEvents>() => {
	const store: StoreEvents<T> = {}

	return {
		on<K extends keyof T>(eventName: K, callback: T[K]) {
			const events = store[eventName]

			if (Array.isArray(events)) {
				if (!events.includes(callback)) {
					events.push(callback)
				}
			} else {
				store[eventName] = [callback]
			}
		},

		off<K extends keyof T>(eventName: K, callback: T[K]) {
			const events = store[eventName]

			if (Array.isArray(events)) {
				const index = events.indexOf(callback)

				if (index !== -1) {
					events.splice(index, 1)
				}
			}
		},

		emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>) {
			const events = store[eventName]

			if (Array.isArray(events)) {
				for (const event of events) {
					event(...args)
				}
			}

			return false
		},
	}
}
