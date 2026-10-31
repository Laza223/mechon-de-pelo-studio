import { CanvasTexture, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three';

/** Rasteriza el packshot (SVG o <img>) del producto destacado a una textura para la escena. */
async function rasterize(el: Element, width = 900): Promise<HTMLCanvasElement | null> {
  let src: string;
  let ratio = 4 / 3;
  if (el instanceof SVGSVGElement) {
    const vb = el.viewBox.baseVal;
    ratio = vb.height / vb.width;
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(Math.round(width * ratio)));
    src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  } else if (el instanceof HTMLImageElement) {
    src = el.currentSrc || el.src;
  } else {
    return null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  img.src = src;
  try {
    await img.decode();
  } catch {
    return null;
  }
  if (el instanceof HTMLImageElement) ratio = img.naturalHeight / img.naturalWidth;
  const c = document.createElement('canvas');
  c.width = width;
  c.height = Math.round(width * ratio);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export class ProductPlane {
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;

  private constructor(canvas: HTMLCanvasElement) {
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    const ratio = canvas.height / canvas.width;
    const h = 3.3;
    const geo = new PlaneGeometry(h / ratio, h);
    const mat = new MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.35, depthWrite: true, opacity: 0 });
    this.mesh = new Mesh(geo, mat);
    this.mesh.renderOrder = 1;
    this.mesh.position.set(0, -0.1, 0);
  }

  static async from(el: Element | null): Promise<ProductPlane | null> {
    if (!el) return null;
    const c = await rasterize(el);
    return c ? new ProductPlane(c) : null;
  }

  set opacity(v: number) {
    this.mesh.material.opacity = v;
    this.mesh.visible = v > 0.01;
  }
}
