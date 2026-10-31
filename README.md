# Mechón de Pelo · Hair Studio

Sitio web del estudio de cuidado capilar **Mechón de Pelo** (Luján, Buenos Aires).

**Stack:**
- **Astro 7** con salida estática y TypeScript.
- **Three.js** para "El Mechón vivo": miles de hebras 3D que cambian de forma con el scroll.
- **GSAP**: ScrollTrigger, SplitText, DrawSVG, Flip y CustomEase.
- **Lenis** para el scroll suave.
- **Sanity** como CMS, con el Studio embebido en `/admin` y en español.

## Correr el proyecto

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/
npm run check      # chequeo de tipos
```

Sin variables de entorno el sitio usa el contenido de `src/data/seed-data.ts`, así que funciona aunque Sanity todavía no esté configurado.

## Cómo está armado

| Qué | Dónde |
|---|---|
| Páginas | `src/pages/`: home, `/productos`, `/productos/[slug]`, `404` |
| Secciones | `src/components/` (Hero, Services, Gallery, ProductsShowcase, BookingWizard…) |
| Diseño (tokens, tipografía, botones) | `src/styles/global.css` |
| Contenido (Sanity o seed) | `src/lib/content.ts` → `getContent()` |
| Animaciones | `src/scripts/motion/` |
| Escena 3D | `src/scripts/webgl/` |
| Bolsita de productos y WhatsApp | `src/scripts/shop/` |
| Wizard de turnos | `src/scripts/booking/wizard.ts` |
| CMS | `sanity.config.ts`, `studio/schemas/` |

### El Mechón vivo (`src/scripts/webgl/`)
- **`HairField.ts` + `shaders/`**: las hebras son ribbons instanciados (unas 1700 en desktop y 520 en mobile).
  - El vertex shader calcula 6 formas paramétricas: LOGO, FLOW, UPDO (rodete), STRAIGHT (lacio), BRAID (trenza de 3 cabos) y WRAP (envuelve el producto).
  - El cambio entre formas viaja como una ola a lo largo de cada hebra.
  - El brillo usa el modelo anisotrópico Kajiya-Kay, el típico del pelo.
- **`index.ts`**: la coreografía.
  - Cada sección define un keyframe (estado, posición, escala, fondo oscuro, etc.) y el scroll interpola entre keyframes.
  - El mechón se ancla a elementos del DOM: el trazo del preloader, el producto destacado y el trazo del footer.
- **`ProductPlane.ts`**: rasteriza el packshot del producto destacado y lo mete en la escena, así las hebras pasan por delante y por detrás.
- **Calidad adaptativa**: si el equipo no llega a ~42 fps, se reduce la cantidad de hebras.
- **Fallbacks**: si el navegador no tiene WebGL2 o el usuario pidió `prefers-reduced-motion`, se muestra el trazo SVG estático y todo el contenido sigue accesible.

## Sanity (CMS)

1. Crear un proyecto gratis en <https://www.sanity.io/manage> con el dataset `production`.
2. Copiar `.env.example` a `.env` y completar `PUBLIC_SANITY_PROJECT_ID`.
3. En el proyecto de Sanity, **API → CORS origins**, agregar `http://localhost:4321` y el dominio final, con "Allow credentials" activado.
4. Cargar el contenido inicial:
   - Crear un token con permiso **Editor** en **API → Tokens**.
   - Ponerlo en `.env` como `SANITY_WRITE_TOKEN`.
   - Correr `npm run seed:sanity`.
5. Entrar a `/admin`. Ahí ella puede:
   - Cargar y editar productos: foto, stock (Disponible / Consultar / Agotado), destacados y precio.
   - Cambiar precios de servicios (keratina y botox cuando los confirme).
   - Sumar trabajos a la galería y editar las preguntas frecuentes.
   - Cargar el número de WhatsApp.
6. **Que la web se actualice sola al publicar:**
   - En Vercel, ir a **Settings → Git → Deploy Hooks** y crear un hook.
   - En Sanity, ir a **API → Webhooks**, crear un webhook con esa URL, filtro `_type in ["product","service","productCategory","galleryItem","faq","siteSettings"]` y trigger *create/update/delete*.
   - Cada vez que publique, el sitio se reconstruye en ~1 minuto.
7. Invitarla como **Editor** en **Members**.

## Deploy (Vercel)

- Importar el repo en Vercel. Framework: Astro, build `npm run build`, output `dist`. Node 22.x o superior.
- **`PUBLIC_SITE_URL`** = la URL final (ej. `https://mechon-de-pelo-studio.vercel.app` o el dominio propio). Sin esto, la imagen de preview al compartir el link por WhatsApp no carga.
- Cuando se configure Sanity: `PUBLIC_SANITY_PROJECT_ID` y `PUBLIC_SANITY_DATASET`. Sin ellas el sitio usa el contenido del seed.
- `vercel.json` ya incluye el rewrite de `/admin/*` y el cache de assets.

## WhatsApp
- Con `whatsappNumber` cargado (en Sanity o en el seed), los botones abren `wa.me/<número>?text=…` con el mensaje ya escrito.
- Sin número, se usa el link de la bio (`wa.me/message/…`), que no acepta texto precargado. En ese caso el mensaje se copia al portapapeles y se avisa con un toast.

## Pendientes a pedirle a la clienta
- [ ] **Logo vectorial** (SVG, AI o PDF). Hoy hay una recreación en `src/components/Swoosh.astro` y `Logo.astro`. El trazo de ese SVG es el que muestrea el 3D.
- [ ] **Fotos originales** de trabajos (no las de IG comprimidas) y de productos, idealmente PNG sin fondo. Las de `src/assets/gallery/` son recortes provisorios de sus historias.
- [ ] **Número de WhatsApp** comercial.
- [ ] Precios de **shock de keratina** y **botox capilar**.
- [ ] Medios de pago, envíos/retiro, recargo a domicilio y política de cancelación (hoy la FAQ dice "Consultanos").
- [ ] Dominio (sugerido: `mechondepelo.com.ar`).
