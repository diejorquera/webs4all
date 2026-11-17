import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  /** Identificador corto: genera los ids trabajo-<id> */
  id: string;
  /** Línea superior, ej. "2025 · Buscador de farmacias" */
  /** Años, ej. "2025 - 2026" (línea pequeña superior) */
  years?: string;
  meta: string;
  /** Línea inferior, ej. "Proyecto propio" */
  kind?: string;
  name: string;
  /** Enlace externo (slot "link") */
  link?: ReactNode;
  /** Contenido del panel: imagen y descripción (renderizado por Astro, legible sin JS) */
  children?: ReactNode;
}

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const EVENT = 'workrow:open';

/**
 * Fila de acordeón. Con puntero fino abre con hover/foco; con táctil, con toque.
 * Solo una fila abierta a la vez (como el artboard): las filas se avisan por evento.
 * El contenido llega ya renderizado en el HTML; esta isla solo controla abrir/cerrar.
 */
export default function WorkRow({ id, years, meta, kind, name, link, children }: Props) {
  const [open, setOpen] = useState(false);
  const hovering = useRef(false);
  const btnId = `trabajo-${id}-btn`;
  const panelId = `trabajo-${id}`;

  const fine = () => window.matchMedia(FINE_POINTER).matches;

  const set = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) window.dispatchEvent(new CustomEvent(EVENT, { detail: id }));
    },
    [id],
  );

  // Si otra fila se abre, esta se cierra
  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setOpen(false);
    };
    window.addEventListener(EVENT, onOther);
    return () => window.removeEventListener(EVENT, onOther);
  }, [id]);

  return (
    <article
      className="work"
      data-open={open}
      onMouseEnter={() => {
        hovering.current = true;
        if (fine()) set(true);
      }}
      onMouseLeave={() => {
        hovering.current = false;
        if (fine() && open) set(false);
      }}
      onFocus={() => {
        if (fine()) set(true);
      }}
      onBlur={(e) => {
        if (!fine()) return;
        const to = e.relatedTarget as Node | null;
        if (to && e.currentTarget.contains(to)) return;
        if (!hovering.current && open) set(false);
      }}
    >
      <div className="work-head">
        <h3 className="m-0 text-[length:inherit] font-[inherit]">
          <button
            type="button"
            id={btnId}
            className="work-btn"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={(e) => {
              // Mouse con puntero fino: abre. Teclado (detail 0) y táctil: alterna.
              if (fine() && e.detail !== 0) {
                set(true);
                return;
              }
              set(!open);
            }}
          >
            <span className="work-meta">
              {years && <span className="work-meta-years">{years}</span>}
              <span className="work-meta-line">{meta}</span>
              {kind && <span className="work-meta-kind">{kind}</span>}
            </span>
            <span className="sr-only">. </span>
            <span className="work-name">{name}</span>
            <span className="work-ind" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 10h14" />
                <path className="work-ind-v" d="M10 3v14" style={{ transformOrigin: '10px 10px' }} />
              </svg>
            </span>
          </button>
        </h3>
        {link}
      </div>
      <div className="work-panel" id={panelId} role="region" aria-labelledby={btnId}>
        <div className="work-clip">
          <div className="work-body">{children}</div>
        </div>
      </div>
    </article>
  );
}
