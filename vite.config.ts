import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		glsl(),
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	define: {
		'process.env': {},
		'process.env.NODE_DEBUG': false,
		'process.platform': '"browser"',
		process: {
			env: {},
		},
	},
})
