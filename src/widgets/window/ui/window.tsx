import clsx from 'clsx'
import { useRef } from 'react'
import { createPortal } from 'react-dom'

import { useDraggableWindow } from '../model/window-draggable'

import styles from './window.module.css'

import type { WindowProps } from '../model/window.types'

export const Window = (props: WindowProps) => {
	const winRef = useRef<HTMLDivElement>(null)
	const headRef = useRef<HTMLDivElement>(null)
	const draggable = useDraggableWindow({
		winRef,
		headRef,
	})
	const { x, y } = draggable.position

	return createPortal(
		<div
			ref={winRef}
			className={clsx(styles.window, props.className)}
			style={{
				transform: `translate(${x}px, ${y}px)`,
			}}
		>
			<div ref={headRef} className={styles.header}>
				<div className={styles.headerContent}>{props.title}</div>
				<div className={styles.headerClose} onClick={props.onClose}>
					<div className={styles.icon}></div>
				</div>
			</div>
			<div className={styles.content}>{props.children}</div>
		</div>,
		document.body,
	)
}
