<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quantum AGI Neural Network Visualization</title>
  <style>
    html, body {
      margin: 0;
      overflow: hidden;
      background: #000;
    }
    canvas {
      display: block;
    }
  </style>
</head>
<body>
<canvas id="c"></canvas>

<script id="vertex" type="x-shader/x-vertex">
attribute vec4 position;
void main() {
  gl_Position = position;
}
</script>

<script id="fragment" type="x-shader/x-fragment">
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Random function
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Noise function for organic movement
float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
        mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
    return res*res;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv -= 0.5;
    uv.x *= u_resolution.x / u_resolution.y;

    // Mouse influence
    vec2 mouse = u_mouse / u_resolution - 0.5;
    mouse.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(uv - mouse);
    float mouseInfluence = smoothstep(0.8, 0.0, mouseDist);

    // Neural network grid effect
    vec2 grid = fract(uv * 12.0 + u_time * 0.05 + mouse * 2.5 * mouseInfluence);
    float gridLines = smoothstep(0.95, 1.0, grid.x) + smoothstep(0.95, 1.0, grid.y);
  
    // Quantum wave pattern
    float dist = length(uv);
    float wave = sin(dist * 12.0 - u_time * 0.8) * 0.5 + 0.5; // Slower, more premium wave animation
    wave *= smoothstep(1.2, 0.2, dist);
    wave *= 0.9; // 10% darker waves

    // Neural pulses (slower and darker)
</html>