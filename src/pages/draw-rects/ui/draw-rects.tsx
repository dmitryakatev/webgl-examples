import { useEffect, useRef } from 'react'

import { RectList } from '@/widgets/draw-rects/rect-list'

import { useDrawRectStore } from '../model/draw-rects.store'

import styles from './draw-rects.module.css'

export const DrawRects = () => {
	const setCanvas = useDrawRectStore(({ setCanvas }) => setCanvas)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		if (canvasRef.current) {
			setCanvas(canvasRef.current)
		}
	}, [setCanvas])

	return (
		<div className={styles.container}>
			<div className={styles.canvasWrap}>
				<div className={styles.content}>
					<canvas ref={canvasRef} className={styles.canvas}></canvas>
				</div>
			</div>
			<div className={styles.content}>
				<RectList></RectList>
			</div>
		</div>
	)
}
