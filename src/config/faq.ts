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
    q: '¿Cuánto vale una página web en Chile?',
    a: 'Depende de lo que necesites. Conmigo, una Web Express vale $100.000, el plan Básico $250.000, el Estándar $480.000 y la Tienda online $750.000. Son precios finales y sin IVA, porque trabajo con boleta de honorarios. La mantención y el SEO se cotizan según las horas de trabajo.',
  },
  {
    q: '¿Qué necesito para empezar?',
    a: 'Tu logo si tienes, fotos de tu negocio y media hora para conversar. Si no tienes logo ni fotos, partimos con lo que haya: puedo usar un logo tipográfico simple y fotos de banco de imágenes mientras tanto. Los textos los escribo yo en los planes Básico, Estándar y Tienda; en la Web Express los entregas tú.',
  },
  {
    q: '¿De quién es la página? ¿Puedo editarla yo?',
    a: 'Es tuya: el dominio y las cuentas quedan a tu nombre desde el primer día. En la tienda online administras tú los productos, los precios y los pedidos. En los planes Básico y Estándar los cambios los hago yo: me escribes y lo resuelvo, dentro de los 2 meses de mantención básica incluidos o con una cotización.',
  },
  {
    q: '¿Qué pago aparte y cómo se paga?',
    a: 'Aparte van el dominio (cerca de $10.000 al año) y, en las tiendas, la mensualidad de Shopify o el hosting y la comisión de la pasarela de pago. Todo lo demás está en el precio. Se paga por transferencia: la mitad al empezar y la mitad antes de publicar; en la tienda online, 40%, 30% y 30%. Emito boleta de honorarios por cada pago.',
  },
  {
    q: '¿Cómo se cobran la mantención y el SEO?',
    a: 'Según el tiempo que tome el trabajo. Me cuentas qué necesitas y te doy enseguida la cotización, con las horas estimadas y el valor total, antes de empezar. Si me demoro más de lo estimado, es problema mío y no se te cobra la diferencia.',
  },
];
