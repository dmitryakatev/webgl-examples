import { Program } from '@/modules/webgl'

import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'

// TODO

type LineProgramUniforms = {
	u_ratio: 1
	u_line_width: 1
	u_device_pixel_ratio: 1
	u_color: 4
	u_opacity: 1
}

type LineProgramMatrices = 'u_matrix'

export class LineProgram extends Program<
	LineProgramUniforms,
	LineProgramMatrices
> {
	protected getShaders() {
		return {
			vertexShader,
			fragmentShader,
		}
	}
}
