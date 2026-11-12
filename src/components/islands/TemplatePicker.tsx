import { useState, type ReactNode } from 'react';

interface Template {
  /** Ej. "Plantilla 1 · Profesional de salud" */
  name: string;
  /** Enlace de WhatsApp con el mensaje de esa plantilla (armado en el servidor) */
  href: string;
}

interface Props {
  templates: Template[];
  /** Enlace de WhatsApp cuando todavía no se elige plantilla */
  defaultHref: string;
  /** Slots de Astro (HTML estático, legible sin JS) */
  intro?: ReactNode;
  thumb1?: ReactNode;
  thumb2?: ReactNode;
  thumb3?: ReactNode;
  info?: ReactNode;
  lists?: ReactNode;
  note?: ReactNode;
  diff?: ReactNode;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7.5l2.6 2.6L11 4.5" />
  </svg>
);

/**
 * Web Express: selector de plantilla (radiogroup nativo) + enlace de WhatsApp que
 * cambia según la plantilla elegida + tabla de diferencias plegable.
 * La selección se ve con CSS (:checked), así que funciona aun antes de hidratar.
 */
export default function TemplatePicker({
  templates,
  defaultHref,
  intro,
  thumb1,
  thumb2,
  thumb3,
  info,
  lists,
  note,
  diff,
}: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [diffOpen, setDiffOpen] = useState(false);
  const thumbs = [thumb1, thumb2, thumb3];
  const href = selected === null ? defaultHref : templates[selected].href;

  return (
    <>
      <div>{intro}</div>

      <fieldset className="pr-tpls">
        <legend className="sr-only">Plantillas</legend>
        {templates.map((t, i) => (
          <label key={t.name} className="pr-thumb">
            <input
              type="radio"
              name="plantilla"
              value={t.name}
              className="pr-radio"
              checked={selected === i}
              onChange={() => setSelected(i)}
            />
            <span className="pr-frame">
              <span className="pr-bar" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="pr-page" aria-hidden="true">
                {thumbs[i]}
              </span>
              <span className="pr-check" aria-hidden="true">
                <CheckIcon />
              </span>
            </span>
            <span className="pr-cap">{t.name}</span>
          </label>
        ))}
      </fieldset>

      <div className="pr-xgrid">
        <div>{info}</div>
        <div className="pr-two">{lists}</div>
        <div className="pr-act">
          <a
            className="pr-btn"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Elegir mi plantilla
          </a>
          {note}
        </div>
      </div>

      <div>
        <button
          type="button"
          className="pr-diffbtn"
          aria-expanded={diffOpen}
          aria-controls="precios-diferencias"
          onClick={() => setDiffOpen((v) => !v)}
        >
          <span>Ver diferencias con el Básico</span>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5l4 4 4-4" />
          </svg>
        </button>
        <div className="pr-diff" id="precios-diferencias" data-open={diffOpen}>
          <div className="pr-diffclip">{diff}</div>
        </div>
      </div>
    </>
  );
}
