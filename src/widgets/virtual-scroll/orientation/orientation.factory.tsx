import { OrientationHorizontal } from './orientation.horizontal'
import { OrientationVertical } from './orientation.vertical'

import type { VirtualScrollOrientation, Orientation } from './orientation.types'

export const createOrientation = (
	orientation: VirtualScrollOrientation = 'vertical',
): Orientation => {
	if (orientation === 'vertical') {
		return new OrientationVertical()
	}

	return new OrientationHorizontal()
}
