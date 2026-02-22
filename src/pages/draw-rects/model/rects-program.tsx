import { Program } from '@/modules/webgl'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

// TODO
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type RectProgramUniforms = {}

type RectProgramMatrices = 'u_Transform'

export class RectProgram extends Program<
	RectProgramUniforms,
	RectProgramMatrices
> {
	protected getShaders() {
		return {
			vertexShader,
			fragmentShader,
		}
	}
}
