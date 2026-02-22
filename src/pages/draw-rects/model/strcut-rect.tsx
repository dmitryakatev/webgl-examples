// что бы нарисовать прямоугольник
// нужно 2 треугольника по 3 точки

import { StructArrayFactory } from '@/modules/struct-array'
import { BufferFactory } from '@/modules/webgl'

import type { StructPointForRect } from './draw-rects.types'

// 2 * 3 = 6 точек
export const COUNT_VERTEX = 6

export const structArrayFactory = new StructArrayFactory<StructPointForRect>({
	// по умолчанию создаем массив для 5 прямоугольников
	capacity: COUNT_VERTEX * 5,
	fields: [
		{
			name: 'a_position',
			type: 'int16',
			count: 2,
		},
		{
			name: 'a_offset',
			type: 'int8',
			count: 2,
		},
		{
			name: 'a_radius',
			type: 'int16',
			count: 1,
		},
	],
})

export const bufferFactory = new BufferFactory(structArrayFactory)
