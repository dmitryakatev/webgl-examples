precision mediump float;

uniform lowp vec4 u_color;
uniform lowp float u_opacity;

varying vec2 v_normal;
varying vec2 v_line_width;

void main() {
	float antialiasing_gap_width = v_line_width.x;
	float full_line_width = v_line_width.y;

	float dist = length(v_normal) * full_line_width;

	float alpha = clamp(
		min(dist + antialiasing_gap_width, full_line_width - dist) / antialiasing_gap_width,
		0.0,
		1.0
	);

    gl_FragColor = u_color * (alpha * u_opacity);
}
