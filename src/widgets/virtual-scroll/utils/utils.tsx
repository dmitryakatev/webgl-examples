import type { ScrollPosition, SizeElement } from '../virtual-scroll.types'

export const classes = (...args: (string | undefined | null)[]) =>
	args.filter((item) => !!item).join(' ')

// init

export const initScroll = (): ScrollPosition => ({
	scrollLeft: 0,
	scrollTop: 0,
})

export const initSize = (): SizeElement => ({
	width: 0,
	height: 0,
})

// has change

const MIN = 0.00001
export const hasChange = (curr: number, next: number) =>
	Math.abs(curr - next) > MIN
