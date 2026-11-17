import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default defineConfig(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'design-references/', 'public/'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Archivos .astro
  ...astro.configs.recommended,

  // Accesibilidad (jsx-a11y) y hooks, para plantillas .astro e islas .tsx
  {
    files: ['**/*.astro', '**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // role="list" en <ul>/<ol> con list-style:none restaura la semántica de lista en Safari/VoiceOver
      'jsx-a11y/no-redundant-roles': ['error', { nav: ['navigation'], ul: ['list'], ol: ['list'] }],
    },
  },
  {
    files: ['**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.flat.recommended.rules },
  },

  // Código que corre en el navegador
  {
    files: ['src/**/*.{ts,tsx,astro}'],
    languageOptions: { globals: { ...globals.browser } },
  },

  // Configuración y tests (Node)
  {
    files: ['*.config.{js,mjs,ts}', 'tests/**/*.ts', 'worker/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
  },
);
