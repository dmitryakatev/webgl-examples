export type WebGLEmulatorRawShader = {
	source?: string
	type: number
	varyings: Record<string, number>
	fn?: (...args: any[]) => any
}

export type WebGLEmulatorRawProgram = {
	vertex?: WebGLEmulatorRawShader
	fragment?: WebGLEmulatorRawShader
}

export type WebGLEmulatorProgram = {
	vertex: any
	fragment: any

	attributes: Map<number, string>
	uniforms: WeakMap<WebGLUniformLocation, string>
	varyings: Record<string, number>
}

export type AttributePointer = {
	size: number
	type: number
	stride: number
	offset: number
}
