import { useCallback, useMemo } from 'react'

import {
	TableGrid,
	type TableGridCellEvent,
	type TableGridColumn,
} from '@/widgets/table-grid'

import {
	createLine,
	useLineSimpleStore,
} from '../../model/line-simple-panel.store'

import styles from './line-simple-panel.module.css'

import type { LineSettings, Point } from '../../model/line-simple-panel.types'

type Item = {
	desc: string
	pos1: string
	pos2: string
	pos3: string
	join: LineSettings['join']
	cap: LineSettings['cap']
}

export const LineSimpleGrid = () => {
	const onChangeLine = useLineSimpleStore((s) => s.onChangeLine)

	const getKey = useCallback((_item: Item, index: number) => index, [])
	const columns = useMemo<TableGridColumn<Item>[]>(
		() => [
			{
				header: 'Тип',
				key: 'desc',
				width: 100,
			},
			{
				header: 'x: 60: y: 100',
				key: 'pos1',
				flex: 1,
				className: styles.button,
				render: (v) => {
					return <button>{v}</button>
				},
			},
			{
				header: 'x: 80: y: 100',
				key: 'pos2',
				flex: 1,
				className: styles.button,
				render: (v) => {
					return <button>{v}</button>
				},
			},
			{
				header: 'x: 130: y: 70',
				key: 'pos3',
				flex: 1,
				className: styles.button,
				render: (v) => {
					return <button>{v}</button>
				},
			},
		],
		[],
	)

	const data: Item[] = useMemo(
		() => [
			{
				desc: 'round / butt',
				pos1: 'Round / Miter',
				pos2: 'FakeRound / Miter',
				pos3: 'FakeRound / Miter',
				join: 'round',
				cap: 'butt',
			},
			{
				desc: 'miter / butt',
				pos1: 'FlipBevel / Miter',
				pos2: 'Bevel / Miter',
				pos3: 'Butt / Miter',
				join: 'miter',
				cap: 'butt',
			},
			{
				desc: 'round / round',
				pos1: 'Round / Round',
				pos2: 'FakeRound / Round',
				pos3: 'FakeRound / Round',
				join: 'round',
				cap: 'round',
			},
			{
				desc: 'miter / round',
				pos1: 'FlipBevel / Round',
				pos2: 'Bevel / Round',
				pos3: 'Butt / Round',
				join: 'miter',
				cap: 'round',
			},
		],
		[],
	)

	const onCellClick = useCallback(
		(e: TableGridCellEvent<Item>) => {
			const { join, cap } = e.item
			const column = e.column

			const point3: Point = {
				x: 0,
				y: 0,
			}

			switch (column.key) {
				case 'pos1':
					point3.x = 60
					point3.y = 100
					break
				case 'pos2':
					point3.x = 80
					point3.y = 100
					break
				case 'pos3':
					point3.x = 130
					point3.y = 70
					break
			}

			onChangeLine(
				createLine({
					join,
					cap,
					point3,
				}),
			)
		},
		[onChangeLine],
	)

	return (
		<TableGrid<Item, number>
			columns={columns}
			getKey={getKey}
			data={data}
			onCellClick={onCellClick}
		/>
	)
}
