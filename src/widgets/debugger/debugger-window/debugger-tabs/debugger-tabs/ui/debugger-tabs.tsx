import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'

import { Tab, Tabs } from '@/widgets/tabs'

import { TabArrayBuffers } from '../../tab-array-buffers'
import { TabData } from '../../tab-data'

import styles from './debugger-tabs.module.css'

import type {
	DebuggerTabsRef,
	DebuggerTabsProps,
} from '../model/debugger-tabs.types'
import type { BufferDrawed } from '@/widgets/debugger/debugger/model/drawer.types'
import type { TableGridRowEvent } from '@/widgets/table-grid'

export const DebuggerTabs = forwardRef<DebuggerTabsRef, DebuggerTabsProps>(
	(props, ref) => {
		const [buffers, setBuffers] = useState<BufferDrawed[]>([])
		const [selectedBuffer, setSelectBuffer] = useState<BufferDrawed | null>(
			null,
		)
		const [selectedTab, setSelectTab] = useState(0)
		const [disabledTabs, setDisabledTabs] = useState(false)

		const currBuffers = useRef<BufferDrawed[]>([])
		const nextBuffers = useRef<BufferDrawed[]>([])
		const selectedIndex = useRef(-1)
		const timerRef = useRef<number | null>(null)

		useEffect(() => {
			return () => {
				if (timerRef.current !== null) {
					window.clearTimeout(timerRef.current)
					timerRef.current = null
				}
			}
		}, [])

		useImperativeHandle(
			ref,
			() => ({
				add: (item) => {
					nextBuffers.current.push(item)

					if (timerRef.current) {
						clearTimeout(timerRef.current)
					}

					timerRef.current = window.setTimeout(() => {
						timerRef.current = null

						const curr = currBuffers.current
						const next = nextBuffers.current

						if (
							curr.length === next.length &&
							selectedIndex.current !== -1
						) {
							const equal = next.every((item, index) => {
								const nextVertex = item.options.vertexBuffer
								const currVertex =
									curr[index].options.vertexBuffer

								return currVertex == nextVertex
							})

							if (equal) {
								setSelectBuffer(next[selectedIndex.current])
							} else {
								setSelectTab(0)
								setSelectBuffer(null)
							}
						}

						setDisabledTabs(false)
						setBuffers([...next])

						currBuffers.current = next
						nextBuffers.current = []
					}, 500)
				},
				clear: () => {
					setDisabledTabs(true)
					nextBuffers.current = []
				},
			}),
			[],
		)

		const onSelectItem = (item: BufferDrawed) => {
			const index = buffers.indexOf(item)

			if (index !== -1) {
				setSelectBuffer(item)
				selectedIndex.current = index
			}
		}

		const onSelectBuffer = useCallback(
			(e: TableGridRowEvent<BufferDrawed>) => {
				props.drawer.selectBuffer(e.row)
			},
			[props.drawer],
		)

		const onSelectVertex = useCallback(
			(e: TableGridRowEvent<Record<string, number>>) => {
				if (selectedIndex.current !== -1) {
					props.drawer.selectVertex(selectedIndex.current, e.row)
				}
			},
			[props.drawer],
		)

		const onClearSelect = useCallback(() => {
			props.drawer.clearSelect()
		}, [props.drawer])

		return (
			<Tabs
				className={styles.tabsContent}
				contentClassName={styles.content}
				disabled={disabledTabs}
				selected={selectedTab}
				onSelect={setSelectTab}
				keepAlive
			>
				<Tab title="ArrayBuffers" className={styles.tab}>
					<TabArrayBuffers
						buffers={buffers}
						selected={selectedBuffer}
						onSelect={onSelectItem}
						onBufferOver={onSelectBuffer}
						onBufferOut={onClearSelect}
					/>
				</Tab>
				<Tab
					title="Data"
					className={styles.tab}
					disabled={selectedBuffer === null}
				>
					{selectedBuffer && (
						<TabData
							element={selectedBuffer}
							onVertexOver={onSelectVertex}
							onVertexOut={onClearSelect}
						/>
					)}
				</Tab>
				<Tab
					title="Indexses"
					className={styles.tab}
					disabled={selectedBuffer === null}
				>
					List indeses
				</Tab>
				<Tab
					title="Triangles"
					className={styles.tab}
					disabled={selectedBuffer === null}
				>
					Triangles
				</Tab>
			</Tabs>
		)
	},
)
