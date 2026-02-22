import { StructArrayFactory } from '@/modules/struct-array'

import type {
	StructVertex,
	StructIndex,
	StructArrayIndexesFactoryOptions,
} from './array.types'
import type { StructArrayFactoryOptions } from '@/modules/struct-array/struct-array-factory.types'

export const createArrayVertexFactory = <T extends StructVertex[]>(
	options: StructArrayFactoryOptions<T>,
) => {
	return new StructArrayFactory<T>(options)
}

// для массива с индексами мы не уточняем какая будет структура,
// потому что индексы это всегда про 3 вершины треугольника
export const createArrayIndexesFactory = (
	options: StructArrayIndexesFactoryOptions,
) => {
	return new StructArrayFactory<StructIndex>({
		capacity: options.capacity,
		multiplier: options.multiplier,
		fields: [
			{
				name: 'index',
				count: 3,
				type: options.type ?? 'uint16',
			},
		],
	})
}
