<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quantum AGI Neural Network Visualization</title>
  <style>
    .quantum-container {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
    }
    #quantum_agi_canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      display: block;
      background: #000;
    }
  </style>
</head>
<body>
<div class="quantum-container">
  <canvas id="quantum_agi_canvas"></canvas>
</div>

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

    // Mobile optimization for wave pattern
    float scaleFactor = 1.0;
    if(u_resolution.x < 480.0) {
        scaleFactor = 1.5;
        uv *= 1.5;
    }

    // Mouse influence
    vec2 mouse = u_mouse / u_resolution - 0.5;
    mouse.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(uv - mouse);
    float mouseInfluence = smoothstep(0.8, 0.0, mouseDist);

    // Neural network grid effect
    vec2 grid = fract(uv * 12.0 + u_time * 0.045 + mouse * 2.5 * mouseInfluence); // 10% slower animation
</html>