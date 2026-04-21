import styles from '../virtual-scroll.module.css'

import type { Orientation } from './orientation.types'
import type { ScrollPosition, SizeElement } from '../virtual-scroll.types'

export class OrientationHorizontal implements Orientation {
	public readonly cls = styles.horisontal

	getSize({ width }: SizeElement) {
		return width
	}

	getScroll({ scrollLeft }: ScrollPosition) {
		return scrollLeft
	}

	getSizeStyle(size: number) {
		return { width: size }
	}

	getPositionStyle(offset: number) {
		return { left: offset }
	}
}
