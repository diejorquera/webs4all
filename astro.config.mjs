// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción (Cloudflare). Se usa para las URLs canónicas y el sitemap.
  site: 'https://webs4all.cl',

  // Cloudflare sirve /ruta/index.html como /ruta/ (y redirige /ruta a /ruta/): se usa siempre
  // la forma con barra final, así los enlaces, el canonical y el sitemap coinciden.
  trailingSlash: 'always',

  // Incrusta el CSS en el HTML (son ~16 KB): elimina las hojas que bloquean el render.
  build: { inlineStylesheets: 'always' },

  integrations: [
    react(),
    // Las páginas con noindex no van en el sitemap.
    // TODO: quitar '/politica-de-privacidad' de esta lista cuando la página tenga su contenido
    // real y se le quite el noindex (hoy es un marcador).
    sitemap({
      filter: (page) =>
        !['/gracias', '/404', '/politica-de-privacidad'].some((excluded) => page.includes(excluded)),
    }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});