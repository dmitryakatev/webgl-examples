precision mediump float;

varying vec2 v_offset;
varying float v_radius; 

void main() {
  vec2  center = vec2(0,0);
  float dist = distance(center, v_offset);
  float circle = step(v_radius, dist);
  // float circle = step(v_radius, v_offset.x);

  vec3 color = mix(vec3(1.0, 0.2, 0.5), vec3(0.0), circle);
  gl_FragColor = vec4(color, 1.0);
}

