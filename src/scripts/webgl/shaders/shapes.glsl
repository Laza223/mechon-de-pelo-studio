// Formas paramétricas del mechón. Todas en espacio local (~6 unidades de ancho/alto).
// t: 0 (raíz) → 1 (punta). o: offset dentro del mechón (disco unitario). g: cabo (0,1,2). s: seed.

#define PI 3.14159265359
#define TAU 6.28318530718
#define CURVE_N 64

uniform vec3 uCurve[CURVE_N];
uniform float uTime;
uniform float uWind;

vec3 curveAt(float t) {
  float f = clamp(t, 0.0, 1.0) * float(CURVE_N - 1);
  int i = int(floor(f));
  int j = min(i + 1, CURVE_N - 1);
  return mix(uCurve[i], uCurve[j], fract(f));
}

vec3 curveNormal(float t) {
  vec3 a = curveAt(t - 0.01);
  vec3 b = curveAt(t + 0.01);
  vec2 d = normalize(b.xy - a.xy + 1e-5);
  return vec3(-d.y, d.x, 0.0);
}

// 0 · LOGO: el trazo dorado del logo, mechón compacto y afinado en los extremos
vec3 shapeLogo(float t, vec2 o, float g, float s) {
  vec3 c = curveAt(t);
  vec3 n = curveNormal(t);
  float thick = 0.13 * pow(sin(PI * clamp(t, 0.0, 1.0)), 0.7) + 0.006;
  vec3 p = c + n * o.x * thick + vec3(0.0, 0.0, o.y * thick * 0.8);
  p += n * sin(t * 9.0 + uTime * 0.6 + s * 6.0) * 0.004;
  return p;
}

// 1 · FLOW: el trazo abierto en abanico, movido por el viento
vec3 shapeFlow(float t, vec2 o, float g, float s) {
  vec3 c = curveAt(t) * vec3(1.08, 1.5, 1.0);
  vec3 n = curveNormal(t);
  float spread = 0.1 + 0.85 * pow(t, 1.15) * (0.6 + 0.4 * s);
  vec3 p = c + n * o.x * spread + vec3(0.0, 0.0, o.y * spread * 1.2);
  float amp = (0.08 + 0.55 * t * t) * uWind;
  vec3 q = vec3(t * 1.6 + s * 0.35, o.x * 0.8, o.y * 0.8 + uTime * 0.12);
  p += noise3(q) * amp;
  p.y += sin(t * 5.0 - uTime * 0.9 + s * 2.0) * 0.06 * t * uWind;
  return p;
}

// 2 · UPDO: espiral que se enrolla hacia un rodete (peinados)
vec3 shapeUpdo(float t, vec2 o, float g, float s) {
  float turns = 2.35;
  float a = t * turns * TAU + s * 0.25 + 0.6;
  float r = mix(1.85, 0.32, pow(t, 0.72));
  float thick = mix(0.3, 0.12, t);
  r += o.x * thick;
  vec3 p = vec3(cos(a) * r, mix(-0.55, 0.25, t) + o.y * thick * 0.8, sin(a) * r);
  // inclinar para verlo en perspectiva
  float ct = cos(1.05), st = sin(1.05);
  p = vec3(p.x, p.y * ct - p.z * st, p.y * st + p.z * ct);
  p += noise3(vec3(t * 3.0, s * 4.0, uTime * 0.15)) * 0.025;
  return p;
}

// 3 · STRAIGHT: caída lacia y brillante (alisados)
vec3 shapeStraight(float t, vec2 o, float g, float s) {
  float w = mix(1.0, 0.78, t);
  vec3 p = vec3(o.x * 0.62 * w, 2.5 - t * 5.0, o.y * 0.14);
  p.x += sin(t * 2.6 + uTime * 0.45) * 0.06 * t;
  p.z += sin(o.x * 3.0 + t * 2.0) * 0.08;
  p.x += sin(t * 1.4) * 0.12 * o.x;
  return p;
}

// 4 · BRAID: trenza de tres cabos (trenzas africanas)
vec3 shapeBraid(float t, vec2 o, float g, float s) {
  float phi = g * TAU / 3.0;
  float u = t * TAU * 2.6 + phi;
  float A = mix(0.48, 0.3, t);
  vec3 c = vec3(A * sin(u), 2.45 - t * 4.9, A * 0.62 * sin(2.0 * u));
  float thick = mix(0.13, 0.085, t);
  // la raíz nace más abierta, como desde la nuca
  float open = smoothstep(0.12, 0.0, t);
  c.x += (g - 1.0) * 0.55 * open;
  // la punta se suelta
  float loose = smoothstep(0.9, 1.0, t);
  vec3 p = c + vec3(o.x * thick * (1.0 + loose * 2.5), 0.0, o.y * thick * (1.0 + loose * 2.0));
  return p;
}

// 5 · WRAP: hélice que envuelve el producto destacado
vec3 shapeWrap(float t, vec2 o, float g, float s) {
  float turns = 2.15;
  float a = t * turns * TAU + s * 0.18 - 1.2;
  float R = 1.42 + o.x * 0.14;
  float y = 2.35 - t * 4.7 + o.y * 0.12;
  vec3 p = vec3(cos(a) * R, y, sin(a) * R);
  p += noise3(vec3(t * 2.0, s * 3.0, uTime * 0.2)) * 0.03;
  return p;
}

vec3 shapeOf(float id, float t, vec2 o, float g, float s) {
  if (id < 0.5) return shapeLogo(t, o, g, s);
  if (id < 1.5) return shapeFlow(t, o, g, s);
  if (id < 2.5) return shapeUpdo(t, o, g, s);
  if (id < 3.5) return shapeStraight(t, o, g, s);
  if (id < 4.5) return shapeBraid(t, o, g, s);
  return shapeWrap(t, o, g, s);
}
