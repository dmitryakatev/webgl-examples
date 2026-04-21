import { useCallback, useMemo } from 'react'

import { TableGrid } from '@/widgets/table-grid'

import { getBufferData } from '../model/tab-data-unpack'

import type { TabDataProps, BufferDataRow } from '../model/tab-data.types'

export const TabData = (props: TabDataProps) => {
	const { element } = props

	const getKey = useCallback(
		(_item: BufferDataRow, index: number) => index,
		[],
	)
	const { columns, data } = useMemo(() => getBufferData(element), [element])

	return (
		<TableGrid<BufferDataRow, number>
			columns={columns}
			getKey={getKey}
			data={data}
			onRowOver={props.onVertexOver}
			onRowOut={props.onVertexOut}
		/>
	)
}
