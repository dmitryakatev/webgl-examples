import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'
import type { TableGridColumn, TableGridRowEvent } from '@/widgets/table-grid'

export type TabDataProps = {
	element: BufferDrawed
	onVertexOver: (e: TableGridRowEvent<BufferDataRow>) => void
	onVertexOut: () => void
}

export type BufferDataField = {
	name: string
	size: number
}

export type BufferDataRow = Record<string, number>
export type BufferDataColumn = TableGridColumn<BufferDataRow>
export type BufferData = {
	columns: BufferDataColumn[]
	data: BufferDataRow[]
}
