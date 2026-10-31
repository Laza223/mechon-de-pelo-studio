uniform float uOpacity;
uniform float uShine;
uniform float uSweep;
uniform float uDark;
uniform vec3 uRoot;
uniform vec3 uMid;
uniform vec3 uTip;
uniform vec3 uDeep;

varying float vT;
varying float vSide;
varying vec3 vTangent;
varying vec3 vViewPos;
varying float vSeed;
varying float vAlpha;

// Kajiya-Kay: especular anisotrópico, el brillo característico del pelo
float strandSpec(vec3 T, vec3 H, float e) {
  float th = dot(T, H);
  return pow(sqrt(max(1.0 - th * th, 0.0)), e);
}

void main() {
  vec3 T = normalize(vTangent);
  vec3 V = normalize(-vViewPos);
  vec3 L1 = normalize(vec3(-0.55, 0.75, 0.6));
  vec3 L2 = normalize(vec3(0.7, -0.2, 0.8));

  // color raíz → medio → punta, con variación por hebra
  vec3 base = mix(uRoot, uMid, smoothstep(0.0, 0.45, vT));
  base = mix(base, uTip, smoothstep(0.45, 1.0, vT));
  base = mix(base, uDeep, smoothstep(0.55, 1.0, vSeed) * 0.55);

  float diff = mix(0.55, 1.0, sqrt(max(1.0 - pow(dot(T, L1), 2.0), 0.0)));
  float s1 = strandSpec(T, normalize(L1 + V), 90.0);
  float s2 = strandSpec(T, normalize(L2 + V), 18.0);

  // barrido de brillo (alisados)
  float sweep = exp(-pow((vT - uSweep) * 7.0, 2.0)) * uShine;

  vec3 col = base * diff;
  col += vec3(1.0, 0.95, 0.85) * s1 * (0.35 + uShine * 0.6 + uDark * 0.25);
  col += uTip * s2 * 0.25;
  col += vec3(1.0, 0.93, 0.78) * sweep * 0.55;
  col = mix(col, col * 1.18 + vec3(0.03, 0.02, 0.0), uDark);

  float edge = 1.0 - smoothstep(0.55, 1.0, abs(vSide));
  float ends = smoothstep(0.0, 0.05, vT) * (1.0 - smoothstep(0.82, 1.0, vT));
  float a = edge * ends * vAlpha * uOpacity * mix(0.62, 0.95, vSeed);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, a);
}
