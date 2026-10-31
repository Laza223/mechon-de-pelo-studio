// position.x = t (0→1 a lo largo de la hebra), position.y = lado del ribbon (-1 | 1)
attribute float aSeed;
attribute vec2 aOffset;
attribute float aGroup;
attribute float aWidth;

uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uStagger;
uniform float uWidth;
uniform float uPx;
uniform vec3 uPointer;
uniform vec2 uPointerVel;
uniform float uPointerStrength;
uniform float uSegments;

varying float vT;
varying float vSide;
varying vec3 vTangent;
varying vec3 vViewPos;
varying float vSeed;
varying float vAlpha;

vec3 morph(float t) {
  vec3 a = shapeOf(uFrom, t, aOffset, aGroup, aSeed);
  if (uMix <= 0.0001) return a;
  vec3 b = shapeOf(uTo, t, aOffset, aGroup, aSeed);
  // el cambio viaja como una ola a lo largo de cada hebra
  float st = uStagger;
  float m = clamp(uMix * (1.0 + st) - st * (aSeed * 0.55 + t * 0.45), 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);
  vec3 p = mix(a, b, m);
  // vuelo orgánico a mitad de la transición
  float lift = sin(m * PI);
  p += noise3(vec3(t * 2.2 + aSeed, aOffset * 1.5 + uTime * 0.1)) * lift * 0.28;
  return p;
}

vec3 toWorld(vec3 p) {
  vec4 w = modelMatrix * vec4(p, 1.0);
  // dedos que pasan por el pelo
  vec2 d = w.xy - uPointer.xy;
  float dist = length(d);
  float r = 0.95;
  float f = exp(-(dist * dist) / (r * r)) * uPointerStrength;
  w.xy += (d / max(dist, 1e-3)) * f * 0.42;
  w.xy += uPointerVel * f * 0.35;
  w.z += f * 0.25;
  return w.xyz;
}

void main() {
  float t = position.x;
  float side = position.y;
  float eps = 1.0 / uSegments;
  float t2 = t < 1.0 - eps ? t + eps : t - eps;
  float dir = t < 1.0 - eps ? 1.0 : -1.0;

  vec3 w1 = toWorld(morph(t));
  vec3 w2 = toWorld(morph(t2));

  vec4 v1 = viewMatrix * vec4(w1, 1.0);
  vec4 v2 = viewMatrix * vec4(w2, 1.0);
  vec3 T = normalize((v2.xyz - v1.xyz) * dir + 1e-6);

  float width = uWidth * aWidth * (1.0 - 0.82 * t);
  float minW = uPx * (-v1.z) * 0.85;
  float w = max(width, minW);

  vec2 sideDir = normalize(vec2(-T.y, T.x) + 1e-6);
  vec4 pos = v1;
  pos.xy += sideDir * side * w;

  vT = t;
  vSide = side;
  vTangent = T;
  vViewPos = pos.xyz;
  vSeed = aSeed;
  vAlpha = clamp(width / w, 0.25, 1.0);

  gl_Position = projectionMatrix * pos;
}
