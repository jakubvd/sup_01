<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quantum AGI Unified Visualization</title>
  <style>
    html, body {
      margin: 0;
      overflow: hidden;
      background: #000;
    }
    canvas {
      display: block;
      filter: blur(0.3px); /* Subtle anti-aliasing */
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
uniform vec2 u_smoothMouse;

// Noise function for organic movement
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

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
    vec2 mousePos = u_smoothMouse.xy / u_resolution.xy;
  
    // Center and aspect-correct coordinates
    vec2 centered_uv = uv - 0.5;
    centered_uv.x *= u_resolution.x / u_resolution.y;
  
    // Mouse influence with smooth falloff
    vec2 mouse_centered = mousePos - 0.5;
    mouse_centered.x *= u_resolution.x / u_resolution.y;
    float mouseDist = length(centered_uv - mouse_centered);
    float mouseInfluence = smoothstep(0.8, 0.0, mouseDist);
  
    // Grid effect
    float gridScale = 12.0 + mouseInfluence * 3.0;
    vec2 grid = fract(centered_uv * gridScale - u_time * 0.05);
    float gridLines = smoothstep(0.93, 1.0, grid.x) + smoothstep(0.93, 1.0, grid.y);
    gridLines *= 0.4;