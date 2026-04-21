import { LineSimpleGrid } from './grid'
import styles from './line-simple-panel.module.css'
import { LineSimpleRange } from './range'
import { LineSimpleSettings } from './settings'

export const LineSimplePanel = () => {
	return (
		<div className={styles.panel}>
			<LineSimpleSettings />
			<div className={styles.buttons}>
				<LineSimpleGrid />
				<LineSimpleRange />
			</div>
		</div>
	)
}
