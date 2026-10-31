import {
  BufferAttribute,
  Color,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  NormalBlending,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import noise from './shaders/noise.glsl?raw';
import shapes from './shaders/shapes.glsl?raw';
import vert from './shaders/hair.vert.glsl?raw';
import frag from './shaders/hair.frag.glsl?raw';

export const CURVE_N = 64;

/** Estados del mechón, en el orden en que aparecen en la página. */
export const STATE = { LOGO: 0, FLOW: 1, UPDO: 2, STRAIGHT: 3, BRAID: 4, WRAP: 5 } as const;

export interface HairOptions {
  strands: number;
  segments: number;
  curve: Vector3[];
}

/** Distribución uniforme en un disco (offset de cada hebra dentro del mechón). */
function disk(): [number, number] {
  const r = Math.sqrt(Math.random());
  const a = Math.random() * Math.PI * 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
}

export class HairField {
  readonly mesh: Mesh<InstancedBufferGeometry, ShaderMaterial>;
  readonly uniforms: Record<string, { value: any }>;
  readonly maxStrands: number;

  constructor({ strands, segments, curve }: HairOptions) {
    this.maxStrands = strands;
    const geo = new InstancedBufferGeometry();

    // Tira base: (segments + 1) pares de vértices
    const verts = new Float32Array((segments + 1) * 2 * 3);
    const index: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      verts.set([t, -1, 0, t, 1, 0], i * 6);
      if (i < segments) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    geo.setAttribute('position', new BufferAttribute(verts, 3));
    geo.setIndex(index);

    const seed = new Float32Array(strands);
    const offset = new Float32Array(strands * 2);
    const group = new Float32Array(strands);
    const width = new Float32Array(strands);
    for (let i = 0; i < strands; i++) {
      seed[i] = Math.random();
      const [x, y] = disk();
      offset[i * 2] = x;
      offset[i * 2 + 1] = y;
      group[i] = i % 3;
      // pocas hebras gruesas "de cuerpo" y muchas finas
      width[i] = Math.random() < 0.12 ? 1.8 + Math.random() : 0.55 + Math.random() * 0.7;
    }
    geo.setAttribute('aSeed', new InstancedBufferAttribute(seed, 1));
    geo.setAttribute('aOffset', new InstancedBufferAttribute(offset, 2));
    geo.setAttribute('aGroup', new InstancedBufferAttribute(group, 1));
    geo.setAttribute('aWidth', new InstancedBufferAttribute(width, 1));
    geo.instanceCount = strands;

    this.uniforms = {
      uCurve: { value: curve },
      uTime: { value: 0 },
      uWind: { value: 1 },
      uFrom: { value: STATE.LOGO },
      uTo: { value: STATE.FLOW },
      uMix: { value: 0 },
      uStagger: { value: 0.9 },
      uWidth: { value: 0.0085 },
      uPx: { value: 0.001 },
      uSegments: { value: segments },
      uPointer: { value: new Vector3(99, 99, 0) },
      uPointerVel: { value: new Vector2() },
      uPointerStrength: { value: 0 },
      uOpacity: { value: 1 },
      uShine: { value: 0 },
      uSweep: { value: -1 },
      uDark: { value: 0 },
      uRoot: { value: new Color('#5b3b25') },
      uMid: { value: new Color('#a87a3f') },
      uTip: { value: new Color('#e3c792') },
      uDeep: { value: new Color('#6e4a2c') },
    };

    const header = `#define CURVE_N ${CURVE_N}\n${noise}\n${shapes}\n`;
    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: header + vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: NormalBlending,
      // los ribbons giran en el espacio: hay que dibujar ambas caras
      side: DoubleSide,
    });

    this.mesh = new Mesh(geo, material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
  }

  setCount(n: number) {
    this.mesh.geometry.instanceCount = Math.max(60, Math.min(this.maxStrands, Math.round(n)));
  }

  /** seq continuo: 1.4 = 40% del camino entre los estados seq[1] y seq[2]. */
  setSequence(seqPos: number, seq: number[]) {
    const max = seq.length - 1;
    const p = Math.min(Math.max(seqPos, 0), max);
    const i = Math.min(Math.floor(p), max - 1);
    const f = p - i;
    this.uniforms.uFrom.value = seq[i];
    this.uniforms.uTo.value = seq[i + 1];
    this.uniforms.uMix.value = f;
    if (f >= 0.999) {
      this.uniforms.uFrom.value = seq[i + 1];
      this.uniforms.uMix.value = 0;
    }
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
