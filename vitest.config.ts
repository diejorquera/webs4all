/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig reutiliza la configuración de Astro (import.meta.env, alias, etc.)
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
