import clsx from 'clsx'

import { RectItem } from '../../rect-item'
import { useRectListStore, getId } from '../model/rect-list.store'

import styles from './rect-list.module.css'

export const RectList = () => {
	const list = useRectListStore((s) => s.list)
	const { add, onChange } = useRectListStore()

	return (
		<div>
			<button
				className={styles.add}
				onClick={() =>
					add({
						id: getId(),
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 0,
						offsetX: 0,
						offsetY: 0,
						radius: 0,
					})
				}
			>
				add
			</button>
			<div className={styles.grid}>
				<div className={clsx(styles.row, styles.header)}>
					<div>#</div>
					<div>x1</div>
					<div>y1</div>
					<div>x2</div>
					<div>y2</div>
					<div>offset x</div>
					<div>offset y</div>
					<div>radius</div>
				</div>
				{list.map((item) => (
					<RectItem key={item.id} item={item} onChange={onChange} />
				))}
			</div>
		</div>
	)
}
