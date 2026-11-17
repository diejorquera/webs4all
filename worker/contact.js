// Manejador de POST /api/contact (lo llama worker/index.js)
// Valida, verifica Turnstile y envía el correo con Resend. Los secretos vienen de context.env.

const FROM = 'Webs4all <contacto@webs4all.cl>';
const SITE_NAME = 'webs4all.cl';
const NECESIDADES = ['Página web', 'Tienda online', 'Mantención', 'SEO', 'No estoy seguro'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const fail = (error, status) => json({ ok: false, error }, status);

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

function isPhone(value) {
  if (!/^[+\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    const data = await request.json();
    return data && typeof data === 'object' ? data : {};
  }
  return Object.fromEntries(await request.formData());
}

async function verifyTurnstile(token, secret, ip) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });
  const result = await response.json();
  return result.success === true;
}

export async function handleContact(request, env) {
  let data;
  try {
    data = await readBody(request);
  } catch {
    return fail('No pudimos leer el formulario. Inténtalo de nuevo.', 400);
  }

  // Honeypot: un bot lo rellena. Se finge éxito sin enviar nada.
  if (clean(data.website)) return json({ ok: true });

  const nombre = clean(data.nombre);
  const contacto = clean(data.contacto);
  const necesidad = clean(data.necesidad);
  const mensaje = clean(data.mensaje);

  if (!nombre || nombre.length > 100) return fail('Escribe tu nombre (máximo 100 caracteres).', 400);
  const contactoOk = contacto.includes('@') ? EMAIL_RE.test(contacto) : isPhone(contacto);
  if (!contactoOk || contacto.length > 200) {
    return fail('Déjame un WhatsApp o un correo válido para responderte.', 400);
  }
  if (!NECESIDADES.includes(necesidad)) return fail('Elige una opción.', 400);
  if (mensaje.length > 2000) return fail('El mensaje es muy largo (máximo 2000 caracteres).', 400);

  if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.CONTACT_TO_EMAIL) {
    console.error('[contact] Faltan variables de entorno');
    return fail('El envío no está disponible por ahora. Escríbeme por WhatsApp.', 500);
  }

  const token = clean(data['cf-turnstile-response']);
  let human = false;
  try {
    human = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP'));
  } catch {
    return fail('No pudimos verificar que eres una persona. Inténtalo de nuevo.', 500);
  }
  if (!human) return fail('No pudimos verificar que eres una persona. Recarga e inténtalo de nuevo.', 400);

  const rows = [
    ['Nombre', nombre],
    ['WhatsApp o correo', contacto],
    ['Necesita', necesidad],
    ['Mensaje', mensaje || '(sin mensaje)'],
  ];
  const html =
    `<h2>Nuevo contacto desde ${SITE_NAME}</h2>` +
    rows
      .map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong><br>${escapeHtml(v).replace(/\n/g, '<br>')}</p>`)
      .join('');
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n\n');

  const payload = {
    from: FROM,
    to: [env.CONTACT_TO_EMAIL],
    subject: `Nuevo contacto desde ${SITE_NAME} — ${nombre.replace(/[\r\n]+/g, ' ')}`,
    html,
    text,
  };
  if (contacto.includes('@')) payload.reply_to = contacto;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error('[contact] Resend respondió', response.status);
      return fail('No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por WhatsApp.', 500);
    }
  } catch {
    return fail('No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme por WhatsApp.', 500);
  }

  return json({ ok: true });
}
