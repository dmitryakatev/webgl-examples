import React from 'react'

import { TableGridItem } from './table-grid-item'
import stylesItem from './table-grid-item.module.css'
import styles from './table-grid.module.css'

import type {
	TableGridProps,
	TableGridRowEvent,
} from '../model/table-grid.types'

const TableGridInner = <T, K extends string | number>(
	props: TableGridProps<T, K>,
) => {
	const { columns, renderExpanded } = props
	const selectedList = props.selected ?? []
	const expandedList = props.expanded ?? []
	const styleColumns = columns
		.map(({ width, flex }) => {
			if (width !== undefined) {
				return `${width}px`
			}

			if (flex !== undefined) {
				return `${flex}fr`
			}

			return '1fr'
		})
		.join(' ')

	const getInfo = (target: EventTarget) => {
		if (!(target instanceof HTMLElement)) {
			return null
		}

		const $cell = target.closest('[data-cell-index]')
		if (!$cell) {
			return null
		}

		const $row = $cell.closest('[data-row-index]')
		if (!$row) {
			return null
		}

		const cell = Number($cell.getAttribute('data-cell-index'))
		const row = Number($row.getAttribute('data-row-index'))
		const column = props.columns[cell]
		const item = props.data[row]

		return {
			cell,
			row,
			column,
			item,
		}
	}

	const createHoverHandler = (
		callback?: (event: TableGridRowEvent<T>) => void,
	) => {
		return (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			const related = e.relatedTarget as HTMLElement
			const $row = (e.target as HTMLElement).closest('[data-row-index]')

			if ($row && event && !$row.contains(related)) {
				const row = Number($row.getAttribute('data-row-index'))
				callback?.({
					item: props.data[row],
					row,
				})
			}
		}
	}

	const onMouseOver = createHoverHandler(props.onRowOver)
	const onMouseOut = createHoverHandler(props.onRowOut)

	const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const event = getInfo(e.target)

		if (event) {
			props.onCellClick?.(event)
			props.onRowClick?.(event)
		}
	}

	return (
		<div
			className={styles.container}
			style={{
				gridTemplateColumns: styleColumns,
			}}
			onMouseOver={onMouseOver}
			onMouseOut={onMouseOut}
			onClick={onClick}
		>
			<div className={stylesItem.item}>
				<div className={stylesItem.cells}>
					{columns.map(({ header, key }) => (
						<div key={key}>{header}</div>
					))}
				</div>
			</div>
			{props.data.map((item, index) => {
				const id = props.getKey(item, index)
				const selected = selectedList.includes(id)
				const expanded = expandedList.includes(id)

				return (
					<TableGridItem<T>
						key={id}
						item={item}
						index={index}
						columns={columns}
						selected={selected}
						expanded={expanded}
						renderExpanded={renderExpanded}
					/>
				)
			})}
		</div>
	)
}

export const TableGrid = React.memo(TableGridInner) as <
	T,
	K extends string | number,
>(
	// eslint-disable-next-line no-unused-vars
	props: TableGridProps<T, K>,
) => ReturnType<typeof TableGridInner>
