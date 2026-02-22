import type { WebGLEmulatorContext } from '../../debugger/model/emulator'

export type DebuggerPanelProps = {
	emulator: WebGLEmulatorContext
	size: {
		width: number
		height: number
	}
}

export type Point = {
	x: number
	y: number
}
