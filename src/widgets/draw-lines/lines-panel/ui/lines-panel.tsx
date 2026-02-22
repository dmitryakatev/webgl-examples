import { LinePanelSettings } from '../../line-panel-settings'
import { useLinesSettingsStore } from '../model/lines-panel.store'

import styles from './lines-panel.module.css'

export const LinesPanel = () => {
	const lines = useLinesSettingsStore((s) => s.lines)
	const onChangeCap = useLinesSettingsStore((s) => s.onChangeCap)
	const onChangeJoin = useLinesSettingsStore((s) => s.onChangeJoin)
	const onChangeMitterLimit = useLinesSettingsStore(
		(s) => s.onChangeMitterLimit,
	)
	const onChangeRoundLimit = useLinesSettingsStore(
		(s) => s.onChangeRoundLimit,
	)

	return (
		<div className={styles.panel}>
			{lines.map((item) => (
				<LinePanelSettings
					key={item.id}
					item={item}
					onChangeCap={onChangeCap}
					onChangeJoin={onChangeJoin}
					onChangeMitterLimit={onChangeMitterLimit}
					onChangeRoundLimit={onChangeRoundLimit}
				/>
			))}
		</div>
	)
}
