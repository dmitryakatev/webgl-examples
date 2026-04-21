import clsx from 'clsx'

import { useLineSimpleStore } from '../../model/line-simple-panel.store'

import styles from './line-simple-settings.module.css'

export const LineSimpleSettings = () => {
	const { line } = useLineSimpleStore()
	const onChangeX1 = useLineSimpleStore((s) => s.onChangeX1)
	const onChangeY1 = useLineSimpleStore((s) => s.onChangeY1)
	const onChangeX2 = useLineSimpleStore((s) => s.onChangeX2)
	const onChangeY2 = useLineSimpleStore((s) => s.onChangeY2)
	const onChangeX3 = useLineSimpleStore((s) => s.onChangeX3)
	const onChangeY3 = useLineSimpleStore((s) => s.onChangeY3)
	const onChangeCap = useLineSimpleStore((s) => s.onChangeCap)
	const onChangeJoin = useLineSimpleStore((s) => s.onChangeJoin)
	const onChangeMitterLimit = useLineSimpleStore((s) => s.onChangeMitterLimit)
	const onChangeRoundLimit = useLineSimpleStore((s) => s.onChangeRoundLimit)
	const onApply = useLineSimpleStore((s) => s.onApply)

	const createOnChangeNumber = (callback: (v: number) => void) => {
		return (e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number(e.target.value)
			if (!isNaN(value)) {
				callback(value)
			}
		}
	}

	const changeX1 = createOnChangeNumber(onChangeX1)
	const changeY1 = createOnChangeNumber(onChangeY1)
	const changeX2 = createOnChangeNumber(onChangeX2)
	const changeY2 = createOnChangeNumber(onChangeY2)
	const changeX3 = createOnChangeNumber(onChangeX3)
	const changeY3 = createOnChangeNumber(onChangeY3)

	const changeJoin = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'miter' || value === 'round') {
			onChangeJoin(value)
		}
	}

	const changeCap = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'butt' || value === 'round') {
			onChangeCap(value)
		}
	}

	const changeMitterLimit = createOnChangeNumber(onChangeMitterLimit)
	const changeRoundLimit = createOnChangeNumber(onChangeRoundLimit)

	return (
		<div className={styles.settings}>
			<div className={clsx(styles.wrap, styles.group)}>
				<input
					name="x1"
					type="number"
					onChange={changeX1}
					className={styles.input}
					value={line.point1.x}
				/>
				<input
					name="y1"
					type="number"
					onChange={changeY1}
					className={styles.input}
					value={line.point1.y}
				/>
			</div>
			<div className={clsx(styles.wrap, styles.group)}>
				<input
					name="x2"
					type="number"
					onChange={changeX2}
					className={styles.input}
					value={line.point2.x}
				/>
				<input
					name="y2"
					type="number"
					onChange={changeY2}
					className={styles.input}
					value={line.point2.y}
				/>
			</div>
			<div className={clsx(styles.wrap, styles.group)}>
				<input
					name="x3"
					type="number"
					onChange={changeX3}
					className={styles.input}
					value={line.point3.x}
				/>
				<input
					name="y3"
					type="number"
					onChange={changeY3}
					className={styles.input}
					value={line.point3.y}
				/>
			</div>
			<div className={styles.wrap}>
				<label htmlFor="">соединение между линиями</label>
				<select
					name="join"
					onChange={changeJoin}
					className={styles.input}
					value={line.join}
				>
					<option value="miter">miter</option>
					<option value="round">round</option>
				</select>
			</div>
			<div className={styles.wrap}>
				<label htmlFor="">округление концов линии</label>
				<select
					name="cap"
					onChange={changeCap}
					className={styles.input}
					value={line.cap}
				>
					<option value="butt">butt</option>
					<option value="round">round</option>
				</select>
			</div>
			<div className={styles.wrap}>
				<label htmlFor="">miterLimit</label>
				<input
					name="miterLimit"
					min={1}
					max={100}
					step={0.01}
					type="number"
					onChange={changeMitterLimit}
					className={styles.input}
					value={line.miterLimit}
				/>
			</div>
			<div className={styles.wrap}>
				<label htmlFor="">roundLimit</label>
				<input
					name="roundLimit"
					type="number"
					onChange={changeRoundLimit}
					className={styles.input}
					value={line.roundLimit}
				/>
			</div>
			<div className={styles.wrap}>
				<button onClick={onApply}>Обновить</button>
			</div>
		</div>
	)
}
