import clsx from 'clsx'
import React from 'react'

import styles from './table-grid-item.module.css'

import type { TableGridItemProps } from '../model/table-grid-item.types'

const TableGridItemInner = <T extends Record<string, unknown>>(
	props: TableGridItemProps<T>,
) => {
	const { item, columns, selected, expanded, index } = props
	const additional = (expanded && props.renderExpanded?.(item)) ?? null

	return (
		<div
			className={clsx(styles.item, {
				[styles.expanded]: expanded,
			})}
			data-row-index={index}
		>
			<div
				className={clsx(styles.cells, styles.row, {
					[styles.selected]: selected,
				})}
			>
				{columns.map((column, i) => {
					const { render, key } = column
					const val: any = key in item ? item[key] : null
					const cls =
						column.align === 'center'
							? styles.center
							: column.align === 'right'
								? styles.right
								: ''

					return (
						<div
							key={key}
							className={clsx(cls, column.className)}
							data-cell-index={i}
						>
							{render
								? render(val, item, { selected, expanded })
								: val}
						</div>
					)
				})}
			</div>
			{additional && (
				<div className={styles.additional}>{additional}</div>
			)}
		</div>
	)
}

export const TableGridItem = React.memo(TableGridItemInner) as <T>(
	props: TableGridItemProps<T>,
) => ReturnType<typeof TableGridItemInner>
