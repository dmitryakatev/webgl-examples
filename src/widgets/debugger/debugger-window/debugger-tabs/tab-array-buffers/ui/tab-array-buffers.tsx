import clsx from 'clsx'
import React, { useCallback, useMemo, useState } from 'react'

import {
	TableGrid,
	type TableGridCellEvent,
	type TableGridColumn,
} from '@/widgets/table-grid'

import {
	getIndexSize,
	getNameByType,
	getStruct,
	getVertexSize,
} from '../model/tab-array-buffers.helpers'

import styles from './tab-array-buffers.module.css'

import type { TabArrayBuffersProps } from '../model/tab-array-buffers.types'
import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'

export const TabArrayBuffers = React.memo((props: TabArrayBuffersProps) => {
	const [expanded, setExpanded] = useState<number[]>([])

	const getKey = useCallback(
		(_item: BufferDrawed, index: number) => index,
		[],
	)
	const columns = useMemo<TableGridColumn<BufferDrawed>[]>(
		() => [
			{
				header: '',
				key: 'expanded',
				width: 35,
				className: styles.expandedCell,
				render: (_v, _data, { expanded }) => {
					return (
						<div
							className={clsx(styles.containerArrow, {
								[styles.expanded]: expanded,
							})}
						>
							<span className={styles.arrow}></span>
						</div>
					)
				},
			},
			{
				header: 'Тип',
				key: 'type',
				width: 200,
				className: styles.selectable,
				render: (_type, buffer) => {
					return getNameByType(buffer.type)
				},
			},
			{
				header: 'Вершин',
				key: 'vertex',
				flex: 1,
				align: 'right',
				render: (_vertex, buffer) => {
					return getVertexSize(buffer)
				},
			},
			{
				header: 'Индексов',
				key: 'indexes',
				flex: 1,
				align: 'right',
				render: (_indexes, buffer) => {
					return getIndexSize(buffer)
				},
			},
		],
		[],
	)
	const onCellClick = useCallback(
		(e: TableGridCellEvent<BufferDrawed>) => {
			const index = e.row

			switch (e.column.key) {
				case 'expanded':
					setExpanded((list: number[]) => {
						if (list.includes(index)) {
							return list.filter((v) => v !== index)
						}

						return [...list, index]
					})
					break
				case 'type':
					props.onSelect(props.buffers[index])
					break
			}
		},
		[props],
	)

	const renderExpanded = useCallback((item: BufferDrawed) => {
		return <pre>{getStruct(item)}</pre>
	}, [])

	const selected: number[] = []
	if (props.selected) {
		const index = props.buffers.indexOf(props.selected)

		if (index !== -1) {
			selected.push(index)
		}
	}

	return (
		<TableGrid<BufferDrawed, number>
			columns={columns}
			getKey={getKey}
			data={props.buffers}
			selected={selected}
			expanded={expanded}
			renderExpanded={renderExpanded}
			onCellClick={onCellClick}
			onRowOver={props.onBufferOver}
			onRowOut={props.onBufferOut}
		/>
	)
})
