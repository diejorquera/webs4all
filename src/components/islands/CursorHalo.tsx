import { useEffect, useMemo, useRef } from 'react';

interface Props {
  /** Color del centro, "r,g,b" (ej. "30,136,229") */
  inner?: string;
  /** Color intermedio, "r,g,b". Por defecto el azul oscuro del Hero */
  mid?: string;
  /** Radio del resplandor mientras sigue al cursor (px) */
  radius?: number;
  /** Radio del resplandor en reposo, antes de mover el mouse (px) */
  idleRadius?: number;
  /** Posición en reposo (CSS), ej. "72% 34%" */
  initialAt?: string;
  /** Opacidades [centro, intermedio] en reposo / siguiendo al cursor */
  idleAlpha?: [number, number];
  activeAlpha?: [number, number];
  /** Posición (%) del color intermedio en reposo / siguiendo al cursor */
  idleMidStop?: number;
  activeMidStop?: number;
}

const LERP = 0.14;

/**
 * Resplandor radial que sigue al cursor dentro de su contenedor (el primer ancestro con caja).
 * El contenedor debe tener position: relative. Solo escritorio (client:media).
 */
export default function CursorHalo({
  inner = '30,136,229',
  mid = '13,71,161',
  radius = 460,
  idleRadius = 520,
  initialAt = '72% 34%',
  idleAlpha = [0.22, 0.14],
  activeAlpha = [0.42, 0.28],
  idleMidStop = 40,
  activeMidStop = 38,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const idleBackground = useMemo(
    () =>
      `radial-gradient(circle ${idleRadius}px at ${initialAt}, rgba(${inner},${idleAlpha[0]}) 0%, rgba(${mid},${idleAlpha[1]}) ${idleMidStop}%, rgba(${mid},0) 72%)`,
    [inner, mid, idleRadius, initialAt, idleAlpha, idleMidStop],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // astro-island usa display: contents, así que no recibe eventos del mouse:
    // el contenedor real es el primer ancestro que genera caja.
    let host = el.parentElement;
    while (host && getComputedStyle(host).display === 'contents') host = host.parentElement;
    if (!host) return;
    const container: HTMLElement = host;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const k = reduce ? 1 : LERP;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx: number | null = null;
    let cy = 0;

    const paint = (x: number, y: number) => {
      el.style.background = `radial-gradient(circle ${radius}px at ${x}px ${y}px, rgba(${inner},${activeAlpha[0]}) 0%, rgba(${mid},${activeAlpha[1]}) ${activeMidStop}%, rgba(${mid},0) 72%)`;
    };

    const tick = () => {
      raf = 0;
      if (cx === null) return;
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      paint(cx, cy);
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (cx === null) {
        cx = tx;
        cy = ty;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };

    container.addEventListener('mousemove', onMove);
    return () => {
      container.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inner, mid, radius, activeAlpha[0], activeAlpha[1], activeMidStop]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 max-[900px]:hidden"
      style={{ background: idleBackground }}
    />
  );
}
