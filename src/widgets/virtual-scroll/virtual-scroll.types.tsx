import type { VirtualScrollOrientation } from './orientation'
import type { ReactNode } from 'react'

export type DynamicBlockSize<T> = (item: T) => number

export type VirtualScrollProps<T> = {
	enable?: boolean
	orientation?: VirtualScrollOrientation
	autoDisable?: number
	blockSize?: number | DynamicBlockSize<T>
	stock?: number
	scrollUpdate?: number
	data: Array<T>
	children: (item: T) => ReactNode
}

export type VirtualScrollRef = {
	scrollTo(scroll: number): void
}

export type ScrollPosition = {
	scrollTop: number
	scrollLeft: number
}

export type SizeElement = {
	width: number
	height: number
}

export type DynamicPosition = {
	calculated: boolean
	positions: number[]
}
