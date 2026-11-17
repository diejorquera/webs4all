import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FIELD_MESSAGES, submitForm, validateAll, validateField, type FormValues } from '../src/lib/form';

const valid: FormValues = {
  nombre: 'Persona de Prueba',
  contacto: 'prueba@example.com',
  necesidad: 'SEO',
  mensaje: '',
};

describe('validateField', () => {
  it('exige nombre, contacto y necesidad con los mensajes del artboard', () => {
    expect(validateField('nombre', '')).toBe(FIELD_MESSAGES.nombre);
    expect(validateField('nombre', '   ')).toBe(FIELD_MESSAGES.nombre);
    expect(validateField('contacto', '')).toBe(FIELD_MESSAGES.contacto);
    expect(validateField('necesidad', '')).toBe(FIELD_MESSAGES.necesidad);
  });

  it('los mensajes de error son los del artboard', () => {
    expect(FIELD_MESSAGES).toEqual({
      nombre: 'Escribe tu nombre.',
      contacto: 'Déjame un WhatsApp o un correo para responderte.',
      necesidad: 'Elige una opción.',
    });
  });

  it('acepta un nombre y una necesidad', () => {
    expect(validateField('nombre', 'Ana')).toBeNull();
    expect(validateField('necesidad', 'SEO')).toBeNull();
  });

  it.each(['a@b.cl', 'persona.nombre+tag@example.com'])('acepta el correo %s', (v) => {
    expect(validateField('contacto', v)).toBeNull();
  });

  it.each(['a@b', 'a@', '@b.cl', 'a b@c.cl'])('rechaza el correo inválido %s', (v) => {
    expect(validateField('contacto', v)).toBe(FIELD_MESSAGES.contacto);
  });

  it.each(['+56 9 1234 5678', '56912345678', '(2) 2345-6789', '912345678'])(
    'acepta el teléfono %s',
    (v) => {
      expect(validateField('contacto', v)).toBeNull();
    },
  );

  it.each(['abc', '12345', '1234567', '1234567890123456', 'hola 12345678'])(
    'rechaza el contacto inválido %s',
    (v) => {
      expect(validateField('contacto', v)).toBe(FIELD_MESSAGES.contacto);
    },
  );
});

describe('validateAll', () => {
  it('no devuelve errores con datos válidos (el mensaje es opcional)', () => {
    expect(validateAll(valid)).toEqual({});
  });

  it('devuelve un error por cada campo obligatorio vacío', () => {
    const errors = validateAll({ nombre: '', contacto: '', necesidad: '', mensaje: '' });
    expect(Object.keys(errors).sort()).toEqual(['contacto', 'necesidad', 'nombre']);
  });
});

describe('submitForm', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('honeypot con contenido: finge éxito y NO envía nada', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', 'https://example.test/form');
    const result = await submitForm(valid, 'soy un bot');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sin endpoint en desarrollo: simula éxito y avisa en consola', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', '');
    vi.stubEnv('DEV', true);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await submitForm(valid, '');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledOnce();
  });

  it('sin endpoint en producción: usa /api/contact y envía el token de Turnstile', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', '');
    vi.stubEnv('DEV', false);
    fetchMock.mockResolvedValue({ ok: true });
    const result = await submitForm(valid, '', 'token-123');
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(JSON.parse(init.body)['cf-turnstile-response']).toBe('token-123');
  });

  it('error del servidor: devuelve el mensaje de la API', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', '');
    vi.stubEnv('DEV', false);
    fetchMock.mockResolvedValue({ ok: false, status: 400, json: async () => ({ ok: false, error: 'Elige una opción.' }) });
    expect(await submitForm(valid, '')).toEqual({ ok: false, error: 'Elige una opción.' });
  });

  it('con endpoint: hace POST JSON con los datos recortados', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', 'https://example.test/form');
    fetchMock.mockResolvedValue({ ok: true });
    const result = await submitForm({ ...valid, nombre: '  Ana  ', mensaje: ' hola ' }, '');
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.test/form');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body)).toEqual({
      nombre: 'Ana',
      contacto: 'prueba@example.com',
      necesidad: 'SEO',
      mensaje: 'hola',
      'cf-turnstile-response': '',
    });
  });

  it('respuesta HTTP de error o fallo de red: devuelve ok:false', async () => {
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', 'https://example.test/form');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await submitForm(valid, '')).toEqual({ ok: false, error: undefined });
    fetchMock.mockRejectedValueOnce(new TypeError('network'));
    expect(await submitForm(valid, '')).toEqual({ ok: false });
  });

  it('nunca escribe datos personales en la consola', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
    // Recorre todos los caminos: simulado, sin endpoint en producción, éxito y fallo
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', '');
    vi.stubEnv('DEV', true);
    await submitForm(valid, '');
    vi.stubEnv('DEV', false);
    await submitForm(valid, '');
    vi.stubEnv('PUBLIC_FORM_ENDPOINT', 'https://example.test/form');
    fetchMock.mockResolvedValueOnce({ ok: true });
    await submitForm(valid, '');
    fetchMock.mockRejectedValueOnce(new Error('fallo'));
    await submitForm(valid, '');
    const logged = spies.flatMap((s) => s.mock.calls.flat()).join(' ');
    expect(logged).not.toContain(valid.nombre);
    expect(logged).not.toContain(valid.contacto);
  });
});
