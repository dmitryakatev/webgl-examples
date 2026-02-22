attribute vec2 a_position;
attribute vec2 a_offset;
attribute float a_radius;

uniform mat4 u_Transform;

varying vec2 v_offset;
varying float v_radius; 

void main() {
  v_offset = a_offset;
  v_radius = a_radius;

  gl_Position = u_Transform * vec4(a_position, 0.0, 1.0);
}
