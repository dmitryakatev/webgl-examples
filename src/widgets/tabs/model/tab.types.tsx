import type { ReactNode } from 'react'

export type TabProps = {
	title: string
	children?: ReactNode
	className?: string
	disabled?: boolean
}
