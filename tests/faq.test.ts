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

  it('usa los mismos nombres de plan y precios que la sección Precios', () => {
    const precios = faq[0].a;
    expect(precios).toContain('Web Express vale $100.000');
    expect(precios).toContain('plan Básico $250.000');
    expect(precios).toContain('Estándar $480.000');
    expect(precios).toContain('Tienda online $750.000');
    // nombres antiguos que no existen en Precios
    expect(precios).not.toMatch(/one page|seis páginas/i);
  });
});
