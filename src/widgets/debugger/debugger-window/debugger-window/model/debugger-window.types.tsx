import type { WebGLEmulatorContext } from '../../../debugger/model/emulator'

export type DebuggerWindowProps = {
	emulator: WebGLEmulatorContext
	onCloce: () => void
	size: {
		width: number
		height: number
	}
}
