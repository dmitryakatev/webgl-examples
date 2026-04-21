#define EXTRUDE_SCALE 0.015873016

attribute vec2 a_pos;
attribute vec2 a_data;

uniform mat4 u_matrix;
uniform mediump float u_ratio;
uniform mediump float u_line_width;
uniform lowp float u_device_pixel_ratio;

varying vec2 v_normal;
varying vec2 v_line_width;

void main() {
    float ANTIALIASING = 1.0 / u_device_pixel_ratio;
	v_line_width = vec2(ANTIALIASING, u_line_width + ANTIALIASING / 2.0);

    vec2 a_extrude = a_data.xy - 128.0;

	mediump vec2 a_pos_remainder = mod(a_pos, 2.0);
	v_normal = vec2(a_pos_remainder.x, sign(a_pos_remainder.y - 0.5));

    mediump vec2 dist = v_line_width.y * a_extrude * EXTRUDE_SCALE;

    gl_Position = u_matrix * vec4(floor(a_pos * 0.5) + dist / u_ratio, 0.0, 1.0);
}
