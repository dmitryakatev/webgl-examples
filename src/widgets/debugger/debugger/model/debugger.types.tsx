import type { ReactNode } from 'react'

export type DebuggerRef = {
	connect: (
		canvas: HTMLCanvasElement,
		gl: WebGLRenderingContext,
	) => WebGLRenderingContext
}

export type DebuggerProps = {
	children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any
