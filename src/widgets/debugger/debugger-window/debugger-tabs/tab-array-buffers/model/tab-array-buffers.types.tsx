import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'
import type { TableGridRowEvent } from '@/widgets/table-grid'

export type TabArrayBuffersProps = {
	buffers: BufferDrawed[]
	selected: BufferDrawed | null
	onSelect: (buffer: BufferDrawed) => void
	onBufferOver: (e: TableGridRowEvent<BufferDrawed>) => void
	onBufferOut: () => void
}
