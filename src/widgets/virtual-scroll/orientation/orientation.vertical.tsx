import styles from '../virtual-scroll.module.css'

import type { Orientation } from './orientation.types'
import type { ScrollPosition, SizeElement } from '../virtual-scroll.types'

export class OrientationVertical implements Orientation {
	public readonly cls = styles.vertical

	getSize({ height }: SizeElement) {
		return height
	}

	getScroll({ scrollTop }: ScrollPosition) {
		return scrollTop
	}

	getSizeStyle(size: number) {
		return { height: size }
	}

	getPositionStyle(offset: number) {
		return { top: offset }
	}
}
