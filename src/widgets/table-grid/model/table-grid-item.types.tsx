import type { TableGridColumn } from './table-grid.types'

export type TableGridItemProps<T> = {
	item: T
	columns: TableGridColumn<T>[]
	index: number
	selected: boolean
	expanded: boolean
	renderExpanded?: (row: T) => React.ReactNode
}
