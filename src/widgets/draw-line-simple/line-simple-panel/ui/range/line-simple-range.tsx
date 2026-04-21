import { useState, type ChangeEvent } from 'react'

import { useLineSimpleStore } from '../../model/line-simple-panel.store'

import styles from './line-simple-range.module.css'

const getPointByAngle = (degrees: number) => {
	const radians = (degrees * Math.PI) / 180
	const radius = 50

	const x = radius * Math.cos(radians)
	const y = radius * Math.sin(radians)

	return { x, y }
}

export const LineSimpleRange = () => {
	const onChangeX3 = useLineSimpleStore((s) => s.onChangeX3)
	const onChangeY3 = useLineSimpleStore((s) => s.onChangeY3)
	const onApply = useLineSimpleStore((s) => s.onApply)
	const [value, setValue] = useState(0)

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value)
		setValue(value)

		const point = getPointByAngle(value)
		const x = Math.round(100 + point.x)
		const y = Math.round(50 + point.y)

		onChangeX3(x)
		onChangeY3(y)
		onApply()
	}

	return (
		<div className={styles.range}>
			<input
				type="range"
				min={0}
				max={180}
				step={1}
				value={value}
				onChange={onChange}
			/>
			<div className={styles.value}>{value}</div>
		</div>
	)
}
