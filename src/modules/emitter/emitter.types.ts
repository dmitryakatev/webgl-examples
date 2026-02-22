// TODO    ??????
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmitterEvents = Record<string, (...args: any[]) => void>
export type StoreEvents<T extends EmitterEvents> = {
	[K in keyof T]?: T[K][]
}

export type Emitter<T extends EmitterEvents> = {
	on<K extends keyof T>(eventName: K, callback: T[K]): void
	off<K extends keyof T>(eventName: K, callback: T[K]): void
	emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void
}
