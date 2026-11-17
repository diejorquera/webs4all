import { describe, expect, it } from 'vitest';
import { faq } from '../src/config/faq';

describe('faq', () => {
  it('tiene las 5 preguntas del artboard, todas con respuesta', () => {
    expect(faq).toHaveLength(5);
    for (const item of faq) {
      expect(item.q.trim().length).toBeGreaterThan(5);
      expect(item.a.trim().length).toBeGreaterThan(40);
    }
  });

  it('no menciona nombres de plan antiguos (los precios viven solo en Precios)', () => {
    const todo = faq.map((item) => `${item.q} ${item.a}`).join(' ');
    expect(todo).not.toMatch(/one page|seis páginas|Web Express|plan Básico|Estándar|Tienda online \$/i);
  });
});
