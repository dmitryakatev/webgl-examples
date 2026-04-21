import type { CanvasDrawer } from '@/widgets/debugger/debugger/model/drawer'
import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'

export type DebuggerTabsRef = {
	add: (item: BufferDrawed) => void
	clear: () => void
}

export type DebuggerTabsProps = {
	drawer: CanvasDrawer
}
