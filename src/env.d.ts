/// <reference types="astro/client" />
declare module '*.glsl?raw' {
  const src: string;
  export default src;
}
interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  readonly PUBLIC_SANITY_DATASET?: string;
  readonly PUBLIC_SITE_URL?: string;
}
