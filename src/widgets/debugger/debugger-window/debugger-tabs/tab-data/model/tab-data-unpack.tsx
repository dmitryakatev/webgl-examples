import { UnpackArray } from '@/widgets/debugger/debugger/model/unpack-array'

import type {
	BufferData,
	BufferDataField,
	BufferDataRow,
	BufferDataColumn,
} from './tab-data.types'
import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'

const getFields = (item: BufferDrawed) => {
	const result: BufferDataField[] = []
	const { attributes } = item.options

	for (const name in attributes) {
		const field = attributes[name]
		const { size } = field

		result.push({
			name,
			size,
		})
	}

	return result
}

export const getBufferData = (element: BufferDrawed): BufferData => {
	const columns: BufferDataColumn[] = [
		{
			header: '#',
			key: '$index',
			width: 35,
		},
	]
	const data: BufferDataRow[] = []

	const { vertexBuffer, attributes } = element.options
	const unpackVertex = new UnpackArray(vertexBuffer, attributes)
	const { stride } = Object.values(attributes)[0]
	const size = Math.round(vertexBuffer.byteLength / stride)
	const fields = getFields(element)
	const ln = fields.length

	for (const { name, size } of fields) {
		for (let i = 0; i < size; ++i) {
			columns.push({
				header: `${name}${size === 1 ? '' : `[${i}]`}`,
				key: `${name}${size === 1 ? '' : `_${i}`}`,
				flex: 1,
			})
		}
	}

	for (let i = 0; i < size; ++i) {
		const attrs = unpackVertex.unpack(i)
		const row: BufferDataRow = {
			$index: i + 1,
		}

		data.push(row)

		for (let j = 0; j < ln; ++j) {
			const field = fields[j]
			const name = field.name
			const values = attrs[name]

			if (field.size === 1) {
				row[name] = values as number
			} else {
				for (let k = 0; k < field.size; ++k) {
					const key = `${name}_${k}`
					row[key] = (values as number[])[k]
				}
			}
		}
	}

	return {
		columns,
		data,
	}
}
