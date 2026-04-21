import { create } from 'zustand'

import { useLineSimpleStore } from '@/widgets/draw-line-simple/line-simple-panel/model/line-simple-panel.store'

import {} from './strcut-line'
import { WebglApp } from './webgl-app'

import type { DrawLineSimpleState } from './draw-line-simple.types'
import type { LineSettings } from '@/widgets/draw-line-simple/line-simple-panel/model/line-simple-panel.types'

export const useDrawLineSimpleStore = create<DrawLineSimpleState>(() => {
	const store = useLineSimpleStore.getState()
	let webglApp: WebglApp | null = null

	const onChangeItem = (item: LineSettings) => {
		if (webglApp) {
			webglApp.refreshLine({
				data: [item.point1, item.point2, item.point3],
				join: item.join,
				cap: item.cap,
				miterLimit: item.miterLimit,
				roundLimit: item.roundLimit,
			})
		}
	}

	store.emitter.on('onChangeLine', onChangeItem)

	return {
		setCanvas(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
			const app = new WebglApp(canvas, gl)

			webglApp = app

			onChangeItem(store.line)
		},
	}
})
