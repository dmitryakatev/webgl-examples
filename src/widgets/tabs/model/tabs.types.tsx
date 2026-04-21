import type { Tab } from '../ui/tab'

export type TabsProps = {
	className?: string
	style?: React.CSSProperties
	contentClassName?: string
	children?: React.ReactElement<typeof Tab>[]
	disabled?: boolean
	selected?: number
	onSelect?: (index: number) => void
	keepAlive?: boolean
}
