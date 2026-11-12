import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Step {
  n: string;
  title: string;
  desc: string;
}

interface Props {
  steps: Step[];
}

type Anim = 'idle' | 'ready' | 'run';

/**
 * Línea de tiempo. Todo el contenido está en el HTML; sin JS se ve completo.
 * Con JS (y sin reduced-motion) se oculta un instante y se anima UNA vez al entrar en pantalla.
 */
export default function Timeline({ steps }: Props) {
  const [anim, setAnim] = useState<Anim>('idle');
  const ref = useRef<HTMLOListElement>(null);

  // Antes del primer pintado: evita el parpadeo "visible → oculto → animado"
  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    setAnim('ready');
  }, []);

  useEffect(() => {
    if (anim !== 'ready') return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAnim('run');
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [anim]);

  const last = steps.length - 1;

  return (
    <ol ref={ref} className="tl" id="linea-tiempo" data-anim={anim}>
      {steps.map((s, i) => (
        <li key={s.n} className={`tl-step tl-s${i}${i === last ? ' tl-last' : ''}`}>
          {i === last ? (
            <span className="tl-more" aria-hidden="true" />
          ) : (
            <>
              <span className="tl-track" aria-hidden="true" />
              <span className="tl-seg" aria-hidden="true" />
            </>
          )}
          <span className="tl-node" aria-hidden="true" />
          <div className="tl-text">
            <span className="tl-num" aria-hidden="true">
              {s.n}
            </span>
            <h4 className="tl-title">{s.title}</h4>
            <p className="tl-desc">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
