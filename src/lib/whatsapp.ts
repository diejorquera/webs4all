import { site } from '../config/site';

/** Mensaje del artboard */
export const DEFAULT_WHATSAPP_MESSAGE = 'Hola Diego, vi tu web y quiero consultar por…';

/**
 * Arma el enlace de WhatsApp: https://wa.me/<numero>?text=<mensaje codificado>.
 * El número va solo con dígitos y código de país (ej. 56912345678).
 */
export function buildWhatsappUrl(
  message: string = DEFAULT_WHATSAPP_MESSAGE,
  number: string = site.whatsapp,
): string {
  const digits = number.replace(/\D/g, '');
  // TODO: completar `whatsapp` en src/config/site.ts. Mientras esté vacío, el enlace
  // abre WhatsApp sin destinatario (https://wa.me/?text=...), igual que el artboard.
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
