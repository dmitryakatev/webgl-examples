import { useEffect, useRef } from 'react'

import styles from './debugger-panel.module.css'

import type { DebuggerPanelProps } from '../model/debugger-panel.types'

export const DebuggerPanel = (props: DebuggerPanelProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const { emulator, size } = props
	const { width, height } = size

	useEffect(() => {
		const canvas = canvasRef.current

		if (!canvas) {
			return
		}

		const context = canvas.getContext('2d')

		if (!context) {
			console.error('2d context не найден!')
			return
		}

		emulator.__connect(canvas, context)

		return () => {
			emulator.__disconnect()
		}
	}, [canvasRef, emulator])

	return (
		<div className={styles.panel}>
			<canvas ref={canvasRef} width={width} height={height}></canvas>
		</div>
	)
}
