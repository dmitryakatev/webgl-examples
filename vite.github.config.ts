import { defineConfig } from 'vite'

import baseConfig from './vite.config'

export default defineConfig({
	...baseConfig,
	base: 'webgl-examples/',
	build: {
		...baseConfig.build,
		outDir: 'dist',
	},
})
