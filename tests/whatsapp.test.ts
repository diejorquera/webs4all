import { describe, expect, it } from 'vitest';
import { buildWhatsappUrl, DEFAULT_WHATSAPP_MESSAGE } from '../src/lib/whatsapp';

describe('buildWhatsappUrl', () => {
  it('sin número usa https://wa.me/?text=… con el mensaje del artboard codificado', () => {
    expect(buildWhatsappUrl(undefined, '')).toBe(
      'https://wa.me/?text=Hola%20Diego%2C%20vi%20tu%20web%20y%20quiero%20consultar%20por%E2%80%A6',
    );
    expect(DEFAULT_WHATSAPP_MESSAGE).toBe('Hola Diego, vi tu web y quiero consultar por…');
  });

  it('con número deja solo los dígitos (código de país incluido)', () => {
    expect(buildWhatsappUrl('Hola', '+56 9 1234 5678')).toBe('https://wa.me/56912345678?text=Hola');
  });

  it('codifica caracteres especiales del mensaje', () => {
    const url = buildWhatsappUrl('plan Básico & más?', '56912345678');
    expect(url).toBe('https://wa.me/56912345678?text=plan%20B%C3%A1sico%20%26%20m%C3%A1s%3F');
  });
});
