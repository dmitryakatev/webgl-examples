import type { Emitter } from '@/modules/emitter'

export type RectListEvents = {
	onAdd(item: RectItem): void
	onEdit(index: number, item: RectItem): void
	onDel(index: number): void
}

export type RectListState = {
	emitter: Emitter<RectListEvents>
	list: RectItem[]
	add(item: RectItem): void
	remove(item: RectItem): void
	onChange: ChangeRectItemField
}

export type ChangeRectItemField = <T extends keyof RectItem>(
	id: number,
	name: T,
	value: RectItem[T],
) => void

export type RectItem = {
	id: number
	x1: number
	y1: number
	x2: number
	y2: number
	offsetX: number
	offsetY: number
	radius: number
}
