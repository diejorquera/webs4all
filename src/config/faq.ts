/**
 * Preguntas frecuentes (textos del artboard, sin cambios).
 * Una sola fuente: las usan la sección Contacto y el JSON-LD FAQPage de la home.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: '¿Qué necesito tener listo para empezar?',
    a: 'Textos y fotos de tu negocio, tu logo (si tienes), y saber qué quieres mostrar. Si no tienes algunas de estas cosas, conversamos.',
  },
  {
    q: '¿Qué significa que el sitio es mío?',
    a: 'Que el dominio está registrado a tu nombre y el sitio puede existir aunque dejes de trabajar conmigo. No soy intermediario: tú eres el dueño.',
  },
  {
    q: '¿Cómo es el proceso de pago?',
    a: '50% al inicio del proyecto y 50% contra entrega. Acepto transferencia bancaria.',
  },
  {
    q: '¿Qué pasa con el hosting y dominio después del primer año?',
    a: 'El primer año está incluido. Pasado ese tiempo, tú renuevas directamente con el proveedor (te guío en ese proceso). El costo anual estimado es de $35.000–$45.000 CLP.',
  },
  {
    q: '¿Haces mantenimiento?',
    a: 'Sí, cotizo planes de mantenimiento mensual según lo que necesites.',
  },
];
