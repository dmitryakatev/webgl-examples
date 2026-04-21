/* eslint-disable react-hooks/refs */
import clsx from 'clsx'
import React, { useRef, useState } from 'react'

import styles from './tabs.module.css'

import type { TabProps } from '../model/tab.types'
import type { TabsProps } from '../model/tabs.types'

export const Tabs = (props: TabsProps) => {
	const [active, setActive] = useState(0)
	const rendered = useRef(new Set<number>())
	const tabs = React.Children.toArray(
		props.children,
	) as React.ReactElement<TabProps>[]

	const selected = props.selected === undefined ? active : props.selected
	const onChangeActive = (index: number) => {
		if (props.selected === undefined) {
			setActive(index)
		} else {
			props.onSelect?.(index)
		}
	}

	return (
		<div
			inert={props.disabled}
			className={clsx(
				styles.tabs,
				{ [styles.disabled]: props.disabled },
				props.className,
			)}
			style={props.style}
		>
			<div className={styles.header}>
				{tabs.map((tab, i) => (
					<button
						key={i}
						className={clsx(
							styles.button,
							tab.props.className,
							i === selected && styles.buttonActive,
						)}
						disabled={tab.props.disabled}
						onClick={() => onChangeActive(i)}
					>
						{tab.props.title}
					</button>
				))}
			</div>
			<div className={clsx(styles.content, props.contentClassName)}>
				{tabs.map((tab, index) => {
					const visible = index === selected
					const render = rendered.current.has(index)

					if (props.keepAlive) {
						if (visible && !render) {
							rendered.current.add(index)
						}
					}

					if (visible || render) {
						return (
							<div
								key={index}
								className={visible ? '' : styles.hidden}
							>
								{tab}
							</div>
						)
					}

					return null
				})}
			</div>
		</div>
	)
}
