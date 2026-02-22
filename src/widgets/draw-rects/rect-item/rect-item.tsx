import React from 'react'

import stylesList from '../rect-list/ui/rect-list.module.css'

import styles from './rect-item.module.css'

import type {
	RectItem as Item,
	ChangeRectItemField,
} from '../rect-list/model/rect-list.types'

type RectItemProps = {
	item: Item
	onChange: ChangeRectItemField
}

export const RectItem = React.memo((props: RectItemProps) => {
	const onChange = (field: keyof Item) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(e.target.value, 10)

			props.onChange(props.item.id, field, value)
		}
	}

	const onChangeX1 = onChange('x1')
	const onChangeY1 = onChange('y1')
	const onChangeX2 = onChange('x2')
	const onChangeY2 = onChange('y2')
	const onChangeOffsetX = onChange('offsetX')
	const onChangeOffsetY = onChange('offsetY')
	const onChangeRadius = onChange('radius')

	return (
		<div className={stylesList.row}>
			<div>{props.item.id}</div>
			<div>
				<input
					type="number"
					name="x1"
					className={styles.input}
					value={props.item.x1}
					onChange={onChangeX1}
				/>
			</div>
			<div>
				<input
					type="number"
					name="y1"
					className={styles.input}
					value={props.item.y1}
					onChange={onChangeY1}
				/>
			</div>
			<div>
				<input
					type="number"
					name="x2"
					className={styles.input}
					value={props.item.x2}
					onChange={onChangeX2}
				/>
			</div>
			<div>
				<input
					type="number"
					name="y2"
					className={styles.input}
					value={props.item.y2}
					onChange={onChangeY2}
				/>
			</div>

			<div>
				<input
					type="number"
					name="offsetX"
					className={styles.input}
					value={props.item.offsetX}
					onChange={onChangeOffsetX}
				/>
			</div>
			<div>
				<input
					type="number"
					name="offsetY"
					className={styles.input}
					value={props.item.offsetY}
					onChange={onChangeOffsetY}
				/>
			</div>
			<div>
				<input
					type="number"
					name="radius"
					className={styles.input}
					value={props.item.radius}
					onChange={onChangeRadius}
				/>
			</div>
		</div>
	)
})
