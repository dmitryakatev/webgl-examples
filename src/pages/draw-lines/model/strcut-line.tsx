import { BufferFactory } from '@/modules/webgl'
import {
	createArrayVertexFactory,
	createArrayIndexesFactory,
} from '@/modules/webgl/array'

import type { StructPointForLine } from './draw-lines.types'

export const arrayLineVertexFactory =
	createArrayVertexFactory<StructPointForLine>({
		capacity: 100,
		fields: [
			{
				name: 'a_pos',
				count: 2,
				type: 'int16',
			},
			{
				name: 'a_data',
				count: 2,
				type: 'uint8',
			},
		],
	})

export const arrayLineIndexesFactory = createArrayIndexesFactory({
	capacity: 100,
})

export const bufferLineVertexFactory = new BufferFactory(arrayLineVertexFactory)
export const bufferLineIndexesFactory = new BufferFactory(
	arrayLineIndexesFactory,
)
