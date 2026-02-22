import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Draggable } from '@/modules/draggable'

import type { Position, WindowDraggableProps } from './window.types'

const calcOffset = (fullSize: number, size: number) => {
	return (fullSize - size) / 2
}

export const useDraggableWindow = (props: WindowDraggableProps) => {
	const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
	const positionRef = useRef({ x: 0, y: 0 })

	useLayoutEffect(() => {
		const target = props.winRef.current

		if (!target) {
			return
		}

		const bodyRect = window.document.body.getBoundingClientRect()
		const winRect = target.getBoundingClientRect()
		const pos: Position = {
			x: calcOffset(bodyRect.width, winRect.width),
			y: calcOffset(bodyRect.height, winRect.height),
		}

		positionRef.current = pos
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPosition(pos)
	}, [props.winRef])

	useEffect(() => {
		const target = props.headRef.current

		if (!target) {
			return
		}

		let snapshot: Position = { x: 0, y: 0 }
		const draggable = new Draggable({
			target,
		})

		draggable.on('start', () => {
			snapshot = positionRef.current
		})

		draggable.on('drag', ({ point: { x, y } }) => {
			const pos = {
				x: snapshot.x + x,
				y: snapshot.y + y,
			}

			positionRef.current = pos
			setPosition(pos)
		})

		return () => {
			draggable.destroy()
		}
	}, [props.headRef])

	return {
		position,
	}
}
