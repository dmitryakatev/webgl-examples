import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'

export type ArrayBuffersItemProps = {
	item: BufferDrawed
	selected?: boolean
	onSelect: (buffer: BufferDrawed) => void
}
