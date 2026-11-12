import { useState } from 'react';

interface Item {
  q: string;
  a: string;
}

interface Props {
  items: Item[];
  /** Índice abierto al inicio (como el artboard: la primera) */
  initialOpen?: number;
}

/**
 * Preguntas frecuentes: una respuesta abierta a la vez (como el artboard).
 * Las respuestas ya están en el HTML inicial; la isla solo controla abrir/cerrar.
 */
export default function FaqAccordion({ items, initialOpen = 0 }: Props) {
  const [open, setOpen] = useState<number | null>(initialOpen);

  return (
    <div className="ct-faq">
      {items.map((item, i) => {
        const isOpen = open === i;
        const n = i + 1;
        return (
          <div key={item.q} className="ct-q" data-open={isOpen}>
            <h4 className="m-0">
              <button
                type="button"
                id={`faq-${n}-btn`}
                className="ct-qbtn"
                aria-expanded={isOpen}
                aria-controls={`faq-${n}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="ct-qtext">{item.q}</span>
                <span className="ct-ind" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M2 8h12" />
                    <path className="ct-ind-v" d="M8 2v12" />
                  </svg>
                </span>
              </button>
            </h4>
            <div className="ct-panel" id={`faq-${n}`} role="region" aria-labelledby={`faq-${n}-btn`}>
              <div className="ct-clip">
                <p className="ct-ans">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
