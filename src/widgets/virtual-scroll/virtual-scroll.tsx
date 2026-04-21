import {
	forwardRef,
	type ForwardedRef,
	useState,
	useLayoutEffect,
	useRef,
	type WheelEvent,
	useImperativeHandle,
} from 'react'

import { createOrientation, type Orientation } from './orientation'
import { getRenderData, updatePositionBlocks } from './utils/range'
import { useThrottle } from './utils/throttle'
import { initScroll, initSize, hasChange, classes } from './utils/utils'
import styles from './virtual-scroll.module.css'

import type {
	VirtualScrollProps,
	ScrollPosition,
	SizeElement,
	DynamicPosition,
	VirtualScrollRef,
} from './virtual-scroll.types'

const VirtualScrolInner = <T,>(
	props: VirtualScrollProps<T>,
	ref: ForwardedRef<VirtualScrollRef>,
) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const frameRef = useRef<HTMLDivElement>(null)

	const inited = useRef(false)
	const originalScroll = useRef<ScrollPosition>(undefined as any) // TODO ??
	const orientation = useRef<Orientation>(undefined as any) // TODO ??
	const collapsed = useRef<boolean>(false)
	const dynamic = useRef<DynamicPosition>(undefined as any) // TODO ??
	const throttle = useThrottle(1000)

	const [frameSize, setFrameSize] = useState<SizeElement>(() => initSize())
	const [renderedScroll, setRenderedScroll] = useState<ScrollPosition>(() =>
		initScroll(),
	)

	if (!inited.current) {
		inited.current = true

		orientation.current = createOrientation(props.orientation)
		originalScroll.current = initScroll()

		dynamic.current = {
			calculated: false,
			positions: [],
		}
	}

	useImperativeHandle(ref, () => ({
		scrollTo(scroll: number) {
			if (containerRef.current) {
				containerRef.current.scrollTop = scroll // TODO ????
			}
		},
	}))

	// effects

	useLayoutEffect(() => {
		const $frame = frameRef.current!
		const resizeObserver = new ResizeObserver((entries) => {
			updateSize(entries[0].contentRect)
		})

		resizeObserver.observe($frame)
		updateSize($frame.getBoundingClientRect())

		return () => {
			resizeObserver.unobserve($frame)
		}
	}, [])

	// helpers

	const updateSize = (nextFrameSize: SizeElement) => {
		const $container = containerRef.current!
		const { width, height } = $container.getBoundingClientRect()

		if (width === 0 || height === 0) {
			collapsed.current = true
			return
		}

		const changeWidth = hasChange(frameSize.width, nextFrameSize.width)
		const changeHeight = hasChange(frameSize.height, nextFrameSize.height)

		if (changeWidth || changeHeight) {
			throttle(() => {
				setFrameSize({
					width: nextFrameSize.width,
					height: nextFrameSize.height,
				})
			})
		}
	}

	// events

	const onScroll = (e: WheelEvent<HTMLDivElement>) => {
		const { scrollTop, scrollLeft } = e.currentTarget
		const currScroll = orientation.current.getScroll(originalScroll.current)
		const nextScroll = orientation.current.getScroll({
			scrollTop,
			scrollLeft,
		})

		originalScroll.current = {
			scrollTop,
			scrollLeft,
		}

		if (props.enable ?? true) {
			if (currScroll !== nextScroll) {
				const rendered = orientation.current.getScroll(renderedScroll)
				const minScroll = props.scrollUpdate ?? 400
				const diffScroll = Math.abs(rendered - nextScroll)

				if (diffScroll > minScroll) {
					setRenderedScroll({
						scrollTop,
						scrollLeft,
					})
				}
			}
		}
	}

	// calc
	let isDynamicSize = false
	let blockSize: number | null

	if (typeof props.blockSize === 'function') {
		isDynamicSize = true
		blockSize = 0

		if (!dynamic.current.calculated) {
			dynamic.current.calculated = true
			dynamic.current.positions = updatePositionBlocks(
				props.data,
				props.blockSize,
			)
		}
	} else {
		blockSize = props.blockSize ?? 100
	}

	const orientationInst = orientation.current
	const renderData = getRenderData({
		enable: props.enable ?? true,
		autoDisable: props.autoDisable ?? 10,
		scroll: orientationInst.getScroll(originalScroll.current),
		size: orientationInst.getSize(frameSize),
		isDynamicSize,
		blockSize: blockSize,
		positions: dynamic.current.positions,
		stock: props.stock ?? 5,
		data: props.data,
	})

	// html
	const offset =
		renderData.offset !== null
			? orientationInst.getPositionStyle(renderData.offset)
			: {}
	const contentSize =
		renderData.contentSize !== null
			? orientationInst.getSizeStyle(renderData.contentSize)
			: {}
	const dataSize =
		renderData.dataSize !== null
			? orientationInst.getSizeStyle(renderData.dataSize)
			: {}
	const orientationClass = orientationInst.cls

	return (
		<div
			ref={containerRef}
			className={classes(styles.container, orientationClass)}
			onScroll={onScroll}
		>
			<div ref={frameRef} className={styles.frame}></div>
			<div className={styles.content} style={contentSize}>
				<div
					className={styles.data}
					style={Object.assign({}, offset, dataSize)}
				>
					{renderData.data.map((item) => props.children(item))}
				</div>
			</div>
		</div>
	)
}

export const VirtualScroll = forwardRef(VirtualScrolInner) as <T>(
	// eslint-disable-next-line no-unused-vars
	props: VirtualScrollProps<T> & { ref?: ForwardedRef<VirtualScrollRef> },
) => ReturnType<typeof VirtualScrolInner>
