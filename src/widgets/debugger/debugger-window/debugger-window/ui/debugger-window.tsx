import { useEffect, useRef } from 'react'

import { Window } from '@/widgets/window'

import { DebuggerPanel } from '../../debugger-panel/ui'
import { DebuggerTabs, type DebuggerTabsRef } from '../../debugger-tabs'

import styles from './debugger-window.module.css'

import type { DebuggerWindowProps } from '../model/debugger-window.types'

export const DebuggerWindow = (props: DebuggerWindowProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const loggerRef = useRef<DebuggerTabsRef>(null)

	const { size, onCloce } = props

	useEffect(() => {
		const canvas = canvasRef.current
		const logger = loggerRef.current

		if (!canvas || !logger) {
			return
		}

		const context = canvas.getContext('2d')

		if (!context) {
			console.error('2d context не найден!')
			return
		}

		props.emulator.__connect(canvas, context, logger)

		return () => {
			props.emulator.__disconnect()
		}
	}, [canvasRef, loggerRef, props.emulator])

	return (
		<Window title="Отладчик WebGL" onClose={onCloce}>
			<div className={styles.content}>
				<div className={styles.debuggerContainer}>
					<DebuggerPanel ref={canvasRef} size={size} />
				</div>
				<div
					className={styles.tabsContainer}
					style={{ height: `${props.size.height + 2}px` }}
				>
					<DebuggerTabs
						ref={loggerRef}
						drawer={props.emulator.drawer}
					/>
				</div>
			</div>
		</Window>
	)
}
