import type { ScrollPosition, SizeElement } from '../virtual-scroll.types'
import type { CSSProperties } from 'react'

export type VirtualScrollOrientation = 'vertical' | 'horizontal'

export type Orientation = {
	cls: string
	getSize(size: SizeElement): number
	getScroll(scroll: ScrollPosition): number
	getSizeStyle(size: number): CSSProperties
	getPositionStyle(offset: number): CSSProperties
}
