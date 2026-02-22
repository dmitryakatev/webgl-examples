import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
	globalIgnores(['dist']),
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'@typescript-eslint': typescriptPlugin,
			import: importPlugin,
		},
		settings: {
			'import/resolver': {
				typescript: true, // Это свяжет линтер с твоим tsconfig.json
				node: true,
			},
		},
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			'prefer-const': 'error',
			'no-unused-vars': 'warn',
			semi: ['error', 'never'],
			'import/order': [
				'error',
				{
					groups: [
						'external', // Пакеты (react)
						'internal', // Алиасы (@/...)
						'parent', // Вышестоящие и текущие
						'sibling',
						'index', // Индексные файлы
						'type', // Типы
					],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],
		},
	},
])
