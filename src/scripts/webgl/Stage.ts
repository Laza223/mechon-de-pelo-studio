import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export class Stage {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  /** Tamaño visible del plano z=0 en unidades de mundo. */
  view = { w: 1, h: 1 };
  size = { w: 1, h: 1 };
  readonly fov = 35;
  readonly distance = 10;

  constructor(readonly host: HTMLElement, opts: { mobile: boolean }) {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, opts.mobile ? 1.25 : 1.5));
    host.appendChild(this.renderer.domElement);

    this.camera = new PerspectiveCamera(this.fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, this.distance);
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.size = { w, h };
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const vh = 2 * this.distance * Math.tan((this.fov * Math.PI) / 360);
    this.view = { w: vh * this.camera.aspect, h: vh };
  }

  /** Tamaño de 1px en unidades de mundo a distancia 1 (para ancho mínimo de hebra). */
  get pxFactor() {
    return (2 * Math.tan((this.fov * Math.PI) / 360)) / this.size.h;
  }

  /** Rect de pantalla (px) → centro y ancho en mundo sobre el plano z=0. */
  rectToWorld(r: DOMRect) {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return {
      x: (cx / this.size.w - 0.5) * this.view.w,
      y: -(cy / this.size.h - 0.5) * this.view.h,
      w: (r.width / this.size.w) * this.view.w,
      h: (r.height / this.size.h) * this.view.h,
    };
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
