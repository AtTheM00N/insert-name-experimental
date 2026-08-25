"use client";

import { useEffect, useRef } from "react";
import { useExperience } from "@/lib/experience";

/* =========================================================================
   PROJECTOR
   A dark room with one light source in it, and that light source is the
   visitor's cursor. Written as a single fragment shader — no three.js, no
   scene graph, ~4kb of work — and rendered at 55% resolution because
   everything it draws is soft by design.
   Falls back to a pure-CSS light for anything that can't or shouldn't.
   ========================================================================= */

const VERT = `#version 100
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `#version 100
precision mediump float;

uniform vec2  uRes;
uniform vec2  uLight;      // pointer, 0..1, y down
uniform float uTime;
uniform float uIn;         // master intensity 0..1
uniform float uScroll;     // 0..1 through the film

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// value noise
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
    mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x),
    u.y
  );
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;                       // match DOM coordinates
  float aspect = uRes.x / max(uRes.y, 1.0);

  vec2 d = uv - uLight;
  d.x *= aspect;
  float dist = length(d);

  /* ---- the beam: two falloffs, one tight, one atmospheric ---- */
  float core = exp(-dist * 7.5) * 0.55;
  float haze = exp(-dist * 2.05) * 0.30;

  /* ---- the light breathes; a projector lamp is never perfectly steady ---- */
  float flicker = 0.94 + 0.06 * noise(vec2(uTime * 1.7, 3.0));

  /* ---- volumetric drift: slow smoke crossing the beam ---- */
  vec2 sp = vec2(uv.x * 2.2 + uTime * 0.012, uv.y * 2.0 - uTime * 0.02);
  float smoke = noise(sp * 1.6) * 0.5 + noise(sp * 3.7) * 0.28;
  float beam = (core + haze * (0.55 + smoke * 0.75)) * flicker;

  /* ---- dust in the light: sparse, parallaxed against the scroll ---- */
  vec2 dg = uv * vec2(aspect, 1.0) * 34.0;
  dg.y += uTime * 0.30 + uScroll * 5.0;
  vec2 cell = floor(dg);
  vec2 f = fract(dg) - 0.5;
  float rnd = hash(cell);
  float mote = 0.0;
  if (rnd > 0.982) {
    float r = length(f + vec2(sin(uTime * 0.5 + rnd * 40.0) * 0.22, 0.0));
    mote = smoothstep(0.10, 0.0, r) * (0.35 + rnd * 0.5);
  }
  mote *= exp(-dist * 2.4);

  /* ---- colour: cold light, warm floor. Signal blue, used as light. ---- */
  vec3 cold = vec3(0.392, 0.686, 0.859);   // #64AFDB
  vec3 warm = vec3(0.96, 0.949, 0.929);    // bone
  vec3 col = mix(cold, warm, clamp(core * 2.4, 0.0, 1.0)) * beam;
  col += vec3(0.82, 0.88, 0.95) * mote;

  /* ---- vignette so the frame edges stay dark ---- */
  vec2 vg = (uv - 0.5) * vec2(aspect, 1.0);
  float vignette = 1.0 - dot(vg, vg) * 0.75;
  col *= clamp(vignette, 0.0, 1.0);

  /* ---- gate weave: barely-there horizontal banding ---- */
  col *= 1.0 - 0.035 * sin(uv.y * 620.0 + uTime * 0.6);

  float a = clamp(max(max(col.r, col.g), col.b), 0.0, 1.0) * uIn;
  gl_FragColor = vec4(col * uIn, a * 0.92);
}
`;

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
};

export function Projector() {
  const { canRunShader, booted, mounted } = useExperience();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = canRunShader;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      }) ?? null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uLight = gl.getUniformLocation(prog, "uLight");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uIn = gl.getUniformLocation(prog, "uIn");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Soft output — render at 55% and let the browser scale it up.
    const SCALE = 0.55;
    let w = 0;
    let h = 0;

    const resize = () => {
      const nw = Math.max(1, Math.round(window.innerWidth * SCALE));
      const nh = Math.max(1, Math.round(window.innerHeight * SCALE));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };

    resize();

    let raf = 0;
    let last = -Infinity;
    let intensity = 0;
    const start = performance.now();
    const FRAME = 1000 / 30; // 30fps is plenty for smoke and dust
    const root = document.documentElement;
    let lost = false;

    const readVar = (name: string, fallback: number) => {
      const raw = getComputedStyle(root).getPropertyValue(name);
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : fallback;
    };

    // Cache pointer reads: getComputedStyle is not free, so sample at 30fps
    // rather than per-frame at display rate.
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (lost || now - last < FRAME) return;
      last = now;

      resize();

      const px = readVar("--px-n", 0.5);
      const py = readVar("--py-n", 0.42);
      const target = booted ? 1 : 0;
      intensity += (target - intensity) * 0.045;

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? doc.scrollTop / max : 0;

      gl.uniform2f(uLight, px, py);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uIn, intensity);
      gl.uniform1f(uScroll, progress);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    raf = requestAnimationFrame(loop);

    const onResize = () => resize();
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => {
      lost = false;
    };

    window.addEventListener("resize", onResize, { passive: true });
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [active, booted]);

  if (!mounted) return null;

  /* No shader? The room still has a light in it. */
  if (!active) {
    return <div className="projector projector--css" aria-hidden="true" data-lit={booted} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="projector projector--gl"
      aria-hidden="true"
      data-lit={booted}
    />
  );
}
