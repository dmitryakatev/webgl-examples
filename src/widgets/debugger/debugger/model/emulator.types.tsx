export type AttrValue = number | number[]
export type VarValue = number | Float32Array

export type UnknownShaderFn = (...args: any[]) => any
export type WebGLEmulatorRawShader = {
	source?: string
	type: number
	varyings: Record<string, number>
	fn?: UnknownShaderFn
}

export type WebGLEmulatorRawProgram = {
	vertex?: WebGLEmulatorRawShader
	fragment?: WebGLEmulatorRawShader
}

export type AttrValues = Record<string, AttrValue>
export type UniformValues = Record<string, AttrValue>
export type VarValues = Record<string, VarValue>

export type VertexShaderFn = (
	attrs: AttrValues,
	uniforms: UniformValues,
	vars: VarValues,
) => Float32Array

export type FragmentShaderFn = (
	uniforms: UniformValues,
	vars: VarValues,
	gl_FragCoord: Float32Array,
) => Float32Array

export type WebGLEmulatorProgram = {
	vertex: VertexShaderFn
	fragment: FragmentShaderFn

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
