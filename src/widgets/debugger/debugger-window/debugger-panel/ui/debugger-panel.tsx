import { forwardRef } from 'react'

import styles from './debugger-panel.module.css'

import type { DebuggerPanelProps } from '../model/debugger-panel.types'

export const DebuggerPanel = forwardRef<HTMLCanvasElement, DebuggerPanelProps>(
	(props, ref) => {
		const { width, height } = props.size

		return (
			<div className={styles.panel}>
				<canvas ref={ref} width={width} height={height}></canvas>
			</div>
		)
	},
)
