import { useEffect, useRef } from 'react'

import { getContext } from '@/modules/webgl'
import { Debugger, type DebuggerRef } from '@/widgets/debugger'
import { LinesPanel } from '@/widgets/draw-lines'

import { useDrawLinesStore } from '../model/draw-lines.store'

import styles from './draw-lines.module.css'

export const DrawLines = () => {
	const setCanvas = useDrawLinesStore(({ setCanvas }) => setCanvas)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const debuggerRef = useRef<DebuggerRef>(null)

	useEffect(() => {
		const canvas = canvasRef.current

		if (canvas) {
			let gl = getContext(canvas)

			if (gl) {
				const dbg = debuggerRef.current

				if (dbg) {
					gl = dbg.connect(canvas, gl)
				}

				setCanvas(canvas, gl)
			}
		}
	}, [setCanvas])

	return (
		<div className={styles.container}>
			<div className={styles.left}>
				<Debugger ref={debuggerRef}>
					<div className={styles.canvasWrap}>
						<canvas
							ref={canvasRef}
							className={styles.canvas}
						></canvas>
					</div>
				</Debugger>
			</div>
			<div className={styles.content}>
				<LinesPanel />
			</div>
		</div>
	)
}
