import {
	Drawer,
	type BufferDrawed,
	type DrawerType,
} from '@/widgets/debugger/debugger/model/drawer.types'
import { UnpackArray } from '@/widgets/debugger/debugger/model/unpack-array'

const drawTypes = new Map<DrawerType, string>([
	[Drawer.Arrays, 'drawArrays'],
	[Drawer.Elements, 'drawElements'],
])

const fieldTypes = new Map<number, string>([
	[WebGLRenderingContext.BYTE, 'Int8'],
	[WebGLRenderingContext.UNSIGNED_BYTE, 'Uint8'],
	[WebGLRenderingContext.SHORT, 'Int16'],
	[WebGLRenderingContext.UNSIGNED_SHORT, 'Uint16'],
	[WebGLRenderingContext.INT, 'Int32'],
	[WebGLRenderingContext.UNSIGNED_INT, 'Uint32'],
	[WebGLRenderingContext.FLOAT, 'Float32'],
])

export const getNameByType = (type: DrawerType) => drawTypes.get(type) as string

export const getVertexSize = (item: BufferDrawed) => {
	const { vertexBuffer, attributes } = item.options
	const { stride } = Object.values(attributes)[0]
	const size = Math.round(vertexBuffer.byteLength / stride)

	return size
}

export const getIndexSize = (item: BufferDrawed) => {
	const { type, indexesBuffer } = item.options
	const stride = UnpackArray.getSize(type)
	const size = Math.round(indexesBuffer.byteLength / stride)

	return size
}

export const getStruct = (item: BufferDrawed) => {
	const { attributes } = item.options
	const result: string[] = []

	for (const name in attributes) {
		const field = attributes[name]
		const type = fieldTypes.get(field.type) as string
		const { size } = field
		const count = size === 1 ? '' : `[${size}]`

		result.push(`    ${name}: ${type}${count}`)
	}

	return 'type Struct = {\n' + result.join('\n') + '\n}'
}
