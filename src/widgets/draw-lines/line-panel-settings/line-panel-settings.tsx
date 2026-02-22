import React from 'react'

import styles from './line-panel-settings.module.css'

import type {
	LineSettings,
	LinesSettingsState,
} from '../lines-panel/model/lines-panel.types'

type LineItemProps = {
	item: LineSettings
	onChangeJoin: LinesSettingsState['onChangeJoin']
	onChangeCap: LinesSettingsState['onChangeCap']
	onChangeMitterLimit: LinesSettingsState['onChangeMitterLimit']
	onChangeRoundLimit: LinesSettingsState['onChangeRoundLimit']
}

export const LinePanelSettings = React.memo((props: LineItemProps) => {
	const onChangeJoin = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'miter' || value === 'round') {
			props.onChangeJoin(props.item.id, value)
		}
	}

	const onChangeCap = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value
		if (value === 'butt' || value === 'round') {
			props.onChangeCap(props.item.id, value)
		}
	}

	const onChangeMiterLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value
		const value = parseInt(raw, 10)
		props.onChangeMitterLimit(props.item.id, value)
	}

	const onChangeRoundLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value
		const value = parseInt(raw, 10)
		props.onChangeRoundLimit(props.item.id, value)
	}

	return (
		<div className={styles.lineSettings}>
			<div>line: {props.item.id}</div>

			<div className={styles.wrap}>
				<select
					name="join"
					onChange={onChangeJoin}
					className={styles.input}
					value={props.item.join}
				>
					<option value="miter">miter</option>
					<option value="round">round</option>
				</select>
			</div>
			<div className={styles.wrap}>
				<select
					name="cap"
					onChange={onChangeCap}
					className={styles.input}
					value={props.item.cap}
				>
					<option value="butt">butt</option>
					<option value="round">round</option>
				</select>
			</div>
			<div className={styles.wrap}>
				<input
					type="number"
					name="miterLimit"
					className={styles.input}
					value={props.item.miterLimit}
					onChange={onChangeMiterLimit}
				/>
			</div>

			<div className={styles.wrap}>
				<input
					type="number"
					name="roundLimit"
					className={styles.input}
					value={props.item.roundLimit}
					onChange={onChangeRoundLimit}
				/>
			</div>

			<div className={styles.wrap}>
				<textarea
					name="roundLimit"
					className={styles.textarea}
					value={JSON.stringify(props.item.data, null, 4)}
				/>
			</div>
		</div>
	)
})
