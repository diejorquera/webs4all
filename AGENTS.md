## Proyecto
Landing de una página + páginas legales para webs4all.cl, servicio de
diseño web de Diego en Chile. Idioma del sitio: español de Chile, tuteo.
Stack: Astro 7, Tailwind 4, islas React solo cuando hay interactividad.

## Fuente de verdad del diseño
- design-references/ está en .gitignore. Es solo lectura: artboards HTML,
  tokens y logos. Nunca lo importes desde src/ ni lo modifiques.
- Los textos se copian EXACTOS de los artboards. No reescribas, resumas
  ni "mejores" copy. Si falta un texto, deja un marcador [PENDIENTE: ...]
  y avísame.
- Datos del sitio solo desde src/config/site.ts (email, LinkedIn, ciudad,
  WhatsApp). El WhatsApp aún está vacío: no inventes un número.

## Estilos
- Solo tokens de src/styles/global.css (variables y @theme). Prohibido
  hardcodear colores, tamaños, radios o duraciones que ya tengan token.
- Si algo no tiene token, pregúntame antes de crearlo.
- Tipografía: Plus Jakarta Sans. Botones con radio 8px.
- Breakpoint del nav y menú móvil: 901px.

## Accesibilidad (obligatorio)
- Foco visible, objetivos táctiles de 44px mínimo, contraste AA.
- Respetar prefers-reduced-motion en toda animación (el halo del cursor
  es solo escritorio y no se monta en táctil).
- Un solo h1 por página; HTML semántico; aria-hidden en decoración.

## Reglas de trabajo
- Trabaja una fase a la vez y no toques secciones que no te pido.
- Interactividad primero en CSS/Astro; React solo si es imprescindible
  (client:visible o client:idle, nunca client:load salvo justificación).
- Imágenes con astro:assets, con width/height y alt.
- Al terminar cada tarea corre npm run build y reporta errores.
- Páginas /404 y /gracias llevan noindex.
- No instales dependencias nuevas sin decirme cuáles y por qué.