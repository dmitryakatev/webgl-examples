import type { ReactNode, RefObject } from 'react'

export type WindowProps = {
	title: string
	onClose: () => void
	children?: ReactNode
	className?: string
}

export type WindowDraggableProps = {
	winRef: RefObject<HTMLDivElement | null>
	headRef: RefObject<HTMLDivElement | null>
}

export type Position = {
	x: number
	y: number
}
