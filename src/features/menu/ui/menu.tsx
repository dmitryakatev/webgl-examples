import clsx from 'clsx'
import { useState } from 'react'
import { Outlet } from 'react-router'

import { NavigationMenu } from '../../navigation-menu'

import styles from './menu.module.css'

export const Menu = () => {
	const [fixed, setFixed] = useState(false)

	return (
		<div className={clsx(styles.container, fixed ? styles.fixed : '')}>
			<div className={styles.content}>
				<Outlet />
			</div>
			<div className={styles.menu}>
				<div
					className={styles.menuButton}
					onClick={() => setFixed((f) => !f)}
				></div>
				<div className={styles.menuContent}>
					<div className={styles.meunTitle}>Примеры</div>
					<div className={styles.menuExamples}>
						<NavigationMenu />
					</div>
				</div>
			</div>
		</div>
	)
}
