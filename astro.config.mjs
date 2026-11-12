// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // TODO: confirmar el dominio final. Se usa para las URLs canónicas y el sitemap.
  site: 'https://webs4all.cl',

  integrations: [
    react(),
    // Las páginas con noindex no van en el sitemap
    sitemap({ filter: (page) => !page.includes('/gracias') && !page.includes('/404') }),
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});