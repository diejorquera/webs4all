import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import {
  submitForm,
  validateAll,
  validateField,
  type FieldErrors,
  type FieldName,
  type FormValues,
} from '../../lib/form';

interface Props {
  /** Correo alternativo si el envío falla (viene de site.ts) */
  email: string;
  /** Enlace de WhatsApp (armado en el servidor con src/lib/whatsapp.ts) */
  whatsappHref: string;
}

const OPTIONS = ['Página web', 'Tienda online', 'Mantención', 'SEO', 'No estoy seguro'];
const ORDER: FieldName[] = ['nombre', 'contacto', 'necesidad'];
const EMPTY: FormValues = { nombre: '', contacto: '', necesidad: '', mensaje: '' };

type Status = 'idle' | 'sending' | 'error';

const SITE_KEY = String(import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '');
const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Carga el script de Turnstile una sola vez. */
function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (!script) {
      script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.dataset.turnstile = '';
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => (window.turnstile ? resolve(window.turnstile) : reject()));
    script.addEventListener('error', () => reject());
  });
}

export default function ContactForm({ email, whatsappHref }: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showSummary, setShowSummary] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const honeypot = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>('');
  const token = useRef('');

  // Turnstile en modo "interaction-only": solo se ve si Cloudflare necesita una verificación manual.
  useEffect(() => {
    if (!SITE_KEY || !widgetRef.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !widgetRef.current) return;
        widgetId.current = api.render(widgetRef.current, {
          sitekey: SITE_KEY,
          appearance: 'interaction-only',
          language: 'es',
          callback: (t: string) => (token.current = t),
          'expired-callback': () => (token.current = ''),
          'error-callback': () => (token.current = ''),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  const set = (name: keyof FormValues, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // Al escribir se quita el error de ese campo (se vuelve a validar al salir de él)
    if (name !== 'mensaje' && errors[name]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[name];
        return next;
      });
    }
  };

  const blur = (name: FieldName) => {
    const message = validateField(name, values[name]);
    setErrors((e) => {
      const next = { ...e };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    if (status === 'sending') return;

    const found = validateAll(values);
    setErrors(found);
    const first = ORDER.find((name) => found[name]);
    if (first) {
      setShowSummary(true);
      setStatus('idle');
      document.getElementById(`ct-${first}`)?.focus();
      return;
    }

    setShowSummary(false);
    setStatus('sending');
    const result = await submitForm(values, honeypot.current?.value ?? '', token.current);
    if (result.ok) {
      window.location.assign('/gracias/');
      return; // se queda en "enviando" mientras navega
    }
    // El token de Turnstile es de un solo uso: se pide uno nuevo para reintentar
    token.current = '';
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
    setServerError(result.error ?? '');
    setStatus('error');
  };

  const errorList = ORDER.filter((name) => errors[name]);
  const sending = status === 'sending';

  const field = (name: FieldName) => ({
    id: `ct-${name}`,
    name,
    className: 'ct-input',
    value: values[name],
    'aria-invalid': errors[name] ? (true as const) : (false as const),
    'aria-describedby': errors[name] ? `ct-${name}-err` : undefined,
    onBlur: () => blur(name),
  });

  return (
    <form className="ct-form" noValidate onSubmit={onSubmit} aria-busy={sending}>
      {/* Resumen de errores: se anuncia al fallar la validación */}
      <div role="alert" className={showSummary && errorList.length ? 'ct-summary' : undefined}>
        {showSummary && errorList.length > 0 && (
          <ul>
            {errorList.map((name) => (
              <li key={name}>
                <a href={`#ct-${name}`}>{errors[name]}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error de red / servidor */}
      <div role="alert" className={status === 'error' ? 'ct-senderr' : undefined}>
        {status === 'error' && (
          <>
            <p className="m-0">
              {serverError || 'No se pudo enviar. Inténtalo de nuevo o escríbeme directo por WhatsApp.'}
            </p>
            <p className="ct-senderr-alt">
              <button type="submit" className="ct-retry">
                Reintentar
              </button>
              <span>
                o escribe a <a href={`mailto:${email}`}>{email}</a>
              </span>
            </p>
          </>
        )}
      </div>

      <div className="ct-field">
        <label className="ct-label" htmlFor="ct-nombre">
          Nombre
        </label>
        <input
          {...field('nombre')}
          type="text"
          autoComplete="name"
          onChange={(e) => set('nombre', e.target.value)}
        />
        {errors.nombre && (
          <p className="ct-err" id="ct-nombre-err">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className="ct-field">
        <label className="ct-label" htmlFor="ct-contacto">
          WhatsApp o correo
        </label>
        <input
          {...field('contacto')}
          type="text"
          autoComplete="email"
          onChange={(e) => set('contacto', e.target.value)}
        />
        {errors.contacto && (
          <p className="ct-err" id="ct-contacto-err">
            {errors.contacto}
          </p>
        )}
      </div>

      <div className="ct-field">
        <label className="ct-label" htmlFor="ct-necesidad">
          ¿Qué necesitas?
        </label>
        <select {...field('necesidad')} onChange={(e) => set('necesidad', e.target.value)}>
          <option value="">Elige una opción</option>
          {OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        {errors.necesidad && (
          <p className="ct-err" id="ct-necesidad-err">
            {errors.necesidad}
          </p>
        )}
      </div>

      <div className="ct-field">
        <label className="ct-label" htmlFor="ct-mensaje">
          Cuéntame un poco más <span className="ct-opt">(opcional)</span>
        </label>
        <textarea
          id="ct-mensaje"
          name="mensaje"
          className="ct-input"
          rows={4}
          value={values.mensaje}
          onChange={(e) => set('mensaje', e.target.value)}
        />
      </div>

      {/* Honeypot: fuera de pantalla, sin etiqueta y oculto para tecnología de apoyo */}
      <div className="ct-hp" aria-hidden="true">
        <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Turnstile (invisible salvo que pida verificación) */}
      <div ref={widgetRef} />

      <p className="ct-privacy">
        Uso tus datos solo para responderte.
      </p>

      <div className="ct-btns">
        <button type="submit" className="ct-btn is-solid" disabled={sending}>
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
        <a className="ct-btn is-line" href={whatsappHref} target="_blank" rel="noopener noreferrer">
          Escríbeme por WhatsApp
        </a>
      </div>
    </form>
  );
}
