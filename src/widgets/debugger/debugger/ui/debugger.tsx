import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { Window } from '@/widgets/window'

import { DebuggerPanel } from '../../debugger-panel/ui'
import { WebGLEmulatorContext } from '../model/emulator'
import { createProxy } from '../model/proxy'

import styles from './debugger.module.css'

import type { DebuggerProps, DebuggerRef } from '../model/debugger.types'

export const Debugger = forwardRef<DebuggerRef, DebuggerProps>(
	({ children }, ref) => {
		const emulator = useRef(new WebGLEmulatorContext())
		const [size, setSize] = useState({ width: 100, height: 100 })
		const [open, setOpen] = useState(false)

		useImperativeHandle(ref, () => ({
			connect: (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => {
				const { width, height } = canvas.getBoundingClientRect()
				setSize({ width, height })

				return createProxy(gl, emulator.current)
			},
		}))

		const onDebuggerOpen = () => {
			setOpen((open) => !open)
		}

		const onDebuggerClose = () => {
			setOpen(() => false)
		}

		return (
			<div className={styles.debugger}>
				{children}
				<button
					className={styles.button}
					title="Открыть окно отладчика"
					onClick={onDebuggerOpen}
				>
					i
				</button>
				{open && (
					<Window title="Отладчик WebGL" onClose={onDebuggerClose}>
						<DebuggerPanel
							size={size}
							// eslint-disable-next-line react-hooks/refs
							emulator={emulator.current}
						/>
					</Window>
				)}
			</div>
		)
	},
)
