export type TableGridProps<T, K extends string | number> = {
	columns: TableGridColumn<T>[]
	data: T[]
	getKey: (row: T, index: number) => K
	selected?: K[]
	expanded?: K[]
	renderExpanded?: (row: T) => React.ReactNode
	onRowOver?: (event: TableGridRowEvent<T>) => void
	onRowOut?: (event: TableGridRowEvent<T>) => void
	onRowClick?: (event: TableGridRowEvent<T>) => void
	onCellClick?: (event: TableGridCellEvent<T>) => void
}

export type TableGridColumn<T> = {
	header: string
	key: Extract<keyof T, string | number> | string
	className?: string
	align?: 'left' | 'center' | 'right'
	width?: number
	flex?: number
	render?: (value: any, record: T, meta: TableGridMeta) => React.ReactNode
}

export type TableGridMeta = {
	selected: boolean
	expanded: boolean
}

export type TableGridRowEvent<T> = {
	row: number
	item: T
}

export type TableGridCellEvent<T> = TableGridRowEvent<T> & {
	cell: number
	column: TableGridColumn<T>
}
