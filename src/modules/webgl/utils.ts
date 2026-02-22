export const getContext = (canvas: HTMLCanvasElement) => {
	const context = canvas.getContext('webgl') // , { preserveDrawingBuffer: true }

	if (!context) {
		console.error('Контекст WebGL не найден')
	}

	return context
}

export const updateSize = (canvas: HTMLCanvasElement) => {
	const { width, height } = canvas.getBoundingClientRect()
	canvas.width = width
	canvas.height = height

	return {
		width,
		height,
	}
}
