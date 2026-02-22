import { NavLink } from 'react-router'

import styles from './nav.module.css'

export const NavigationMenu = () => (
	<nav className={styles.nav}>
		{/* <NavLink to="/" end>
			Главная
		</NavLink> */}
		<NavLink to="/demo-1">Пример 1</NavLink>
		<NavLink to="/demo-2">Пример 2</NavLink>
	</nav>
)
