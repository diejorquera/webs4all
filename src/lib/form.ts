/**
 * Validación y envío del formulario de contacto.
 * Los mensajes de error son los del artboard.
 */

export type FieldName = 'nombre' | 'contacto' | 'necesidad';

export interface FormValues {
  nombre: string;
  contacto: string;
  necesidad: string;
  mensaje: string;
}

export type FieldErrors = Partial<Record<FieldName, string>>;

export const FIELD_MESSAGES: Record<FieldName, string> = {
  nombre: 'Escribe tu nombre.',
  contacto: 'Déjame un WhatsApp o un correo para responderte.',
  necesidad: 'Elige una opción.',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Teléfono: 8 a 15 dígitos, permitiendo +, espacios, guiones y paréntesis. */
function isPhone(value: string): boolean {
  if (!/^[+\d\s().-]+$/.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

/** Devuelve el mensaje de error del campo, o null si es válido. */
export function validateField(name: FieldName, raw: string): string | null {
  const value = raw.trim();
  if (!value) return FIELD_MESSAGES[name];
  if (name === 'contacto') {
    // Con "@" debe ser un correo válido; si no, un teléfono/WhatsApp válido.
    const valid = value.includes('@') ? EMAIL_RE.test(value) : isPhone(value);
    if (!valid) return FIELD_MESSAGES.contacto;
  }
  return null;
}

export function validateAll(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  (['nombre', 'contacto', 'necesidad'] as FieldName[]).forEach((name) => {
    const message = validateField(name, values[name]);
    if (message) errors[name] = message;
  });
  return errors;
}

export type SubmitResult = { ok: true } | { ok: false };

const TIMEOUT_MS = 15000;

/**
 * Envía el formulario por POST (JSON) a PUBLIC_FORM_ENDPOINT.
 * - `honeypot` con contenido => es un bot: se finge éxito y no se envía nada.
 * - Sin endpoint en desarrollo: simula éxito y avisa en consola.
 * - Sin endpoint en producción: falla (mejor que perder un contacto en silencio).
 * Nunca se escribe en consola ningún dato del usuario.
 */
export async function submitForm(values: FormValues, honeypot: string): Promise<SubmitResult> {
  if (honeypot.trim() !== '') return { ok: true };

  const endpoint = String(import.meta.env.PUBLIC_FORM_ENDPOINT ?? '').trim();

  if (!endpoint) {
    if (import.meta.env.DEV) {
      console.warn(
        '[form] PUBLIC_FORM_ENDPOINT está vacío: envío SIMULADO (solo desarrollo). No se envió nada.',
      );
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ok: true };
    }
    console.error('[form] PUBLIC_FORM_ENDPOINT no está configurado: no se puede enviar el formulario.');
    return { ok: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        nombre: values.nombre.trim(),
        contacto: values.contacto.trim(),
        necesidad: values.necesidad,
        mensaje: values.mensaje.trim(),
      }),
      signal: controller.signal,
    });
    return response.ok ? { ok: true } : { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
