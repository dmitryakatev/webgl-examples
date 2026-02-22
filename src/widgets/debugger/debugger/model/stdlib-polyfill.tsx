import GLSL from 'glsl-transpiler'

function sign(v: number | number[]) {
	if (Array.isArray(v)) {
		return v.map((x) => (x > 0 ? 1 : x < 0 ? -1 : 0))
	}
	return v > 0 ? 1 : v < 0 ? -1 : 0
}

GLSL.prototype.stdlib.sign = sign
