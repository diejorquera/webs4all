# webs4all.cl

Sitio de una página (más páginas legales) de **webs4all.cl**, servicio de diseño web de Diego en Chile.
Publicado en Cloudflare: https://webs4all.cl

## Stack

- [Astro](https://astro.build) 7 (sitio estático) con TypeScript
- [Tailwind CSS](https://tailwindcss.com) 4, con los tokens de diseño en `src/styles/global.css`
- Islas de React solo donde hay interactividad (formulario, acordeones, selector de plantilla, etc.)
- Fuente autoalojada: Plus Jakarta Sans (`@fontsource-variable`)

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (`astro dev --background` si se quiere en segundo plano) |
| `npm run build` | Compila el sitio a `dist/` |
| `npm run preview` | Sirve `dist/` para probar el build de producción |
| `npm run lint` | ESLint (incluye reglas de accesibilidad para `.astro` y `.tsx`) |
| `npm run check` | `astro check`: verificación de tipos de todo el proyecto |
| `npm test` | Tests unitarios (Vitest) de `src/lib` y `src/config` |
| `npm run verify` | Lint + tipos + tests + build, en ese orden |

Requiere Node.js 22 o superior.

## Estructura

```
src/
  assets/        Imágenes y logo (las imágenes pasan por astro:assets)
  components/
    layout/      NavBar (incluye el menú móvil) y SiteFooter
    sections/    Hero, Services, CtaBand, Works, Pricing, About, Contact
    islands/     Componentes de React hidratados solo donde hace falta
    ui/          Button, Tag, FinePrint, ExternalArrowLink
  config/        site.ts (email, LinkedIn, ciudad, WhatsApp) y faq.ts
  layouts/       BaseLayout (head, SEO, nav y footer) y ReadingLayout (páginas legales)
  lib/           form.ts (validación y envío) y whatsapp.ts
  pages/         index, politica-de-privacidad, terminos-del-servicio, 404 y gracias
  styles/        global.css (tokens, @theme de Tailwind, reset)
public/          robots.txt, favicon, imagen OG y _headers (cabeceras para Cloudflare)
tests/           Tests de Vitest
```

## Configuración

- **Datos del sitio:** `src/config/site.ts`. El campo `whatsapp` va con solo dígitos y código de país
  (ej. `56912345678`); mientras esté vacío, los botones de WhatsApp abren la app sin destinatario.
- **Formulario de contacto:** copia `.env.example` a `.env` y define `PUBLIC_FORM_ENDPOINT`.
  Es una variable pública: se incrusta **al compilar**, así que en Cloudflare debe estar definida
  como variable de entorno del build. Sin ella, en desarrollo el envío se simula y en producción
  el formulario muestra el mensaje de error.
- **Dominio y URLs:** `site` en `astro.config.mjs`. El sitio usa siempre la forma con barra final
  (`/ruta/`), como sirve Cloudflare.

## Diseño y contenido

- Los textos y valores vienen de los artboards de `design-references/` (carpeta ignorada por git,
  solo lectura). No se reescriben ni se "mejoran" textos sin pedirlo.
- Los pendientes de contenido están marcados como `[PENDIENTE: …]` con un comentario `TODO`:
  `grep -rn "PENDIENTE\|TODO" src astro.config.mjs`

## Despliegue

Cloudflare compila con `npm run build` y publica `dist/`. Cada `push` a `main` despliega.
Antes de subir cambios: `npm run verify`.
