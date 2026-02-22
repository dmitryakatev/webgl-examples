import { create } from 'zustand'

import { useLinesSettingsStore } from '@/widgets/draw-lines/lines-panel/model/lines-panel.store'

import {} from './strcut-line'
import { WebglApp } from './webgl-app'

import type { DrawLinesState } from './draw-lines.types'
import type { LineSettings } from '@/widgets/draw-lines/lines-panel/model/lines-panel.types'

export const useDrawLinesStore = create<DrawLinesState>(() => {
	const store = useLinesSettingsStore.getState()
	let webglApp: WebglApp | null = null

	const onChangeItem = (index: number, item: LineSettings) => {
		if (webglApp) {
			webglApp.refreshLine(index, item)
		}
	}

	store.emitter.on('onChangeLine', onChangeItem)

	return {
		setCanvas(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
			const app = new WebglApp(canvas, gl)

			webglApp = app

			const { lines } = store
			lines.forEach((item, index) => {
				app.addLine()
				onChangeItem(index, item)
			})
		},
	}
})
