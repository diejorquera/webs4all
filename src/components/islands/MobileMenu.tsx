import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  links: { id: string; label: string; href: string }[];
  contactHref: string;
}

const FOCUSABLE = 'a[href], button:not([disabled])';

export default function MobileMenu({ links, contactHref }: Props) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // Sección visible (la publica el script de NavBar.astro)
  useEffect(() => {
    setCurrent(document.documentElement.dataset.navCurrent ?? null);
    const onChange = (e: Event) => setCurrent((e as CustomEvent<string | null>).detail);
    window.addEventListener('navcurrent', onChange);
    return () => window.removeEventListener('navcurrent', onChange);
  }, []);

  // Al abrir: foco al primer enlace. Al cerrar: foco de vuelta al botón.
  useEffect(() => {
    if (open) {
      contentRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    } else if (wasOpen.current) {
      const active = document.activeElement;
      if (!active || active === document.body || panelRef.current?.contains(active)) {
        buttonRef.current?.focus();
      }
    }
    wasOpen.current = open;
  }, [open]);

  // Mientras está abierto: bloquear scroll, Escape, clic fuera, foco atrapado
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [
        buttonRef.current,
        ...Array.from(contentRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ].filter((el): el is HTMLElement => el !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? items.includes(active) : false;
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return; // lo gestiona el botón
      if (contentRef.current?.contains(target)) return;
      close();
    };

    // Si se agranda la pantalla, el menú móvil ya no aplica
    const mq = window.matchMedia('(min-width: 901px)');
    const onMq = () => {
      if (mq.matches) close();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    mq.addEventListener('change', onMq);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      mq.removeEventListener('change', onMq);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        aria-controls="menu-movil"
        onClick={() => setOpen((v) => !v)}
        className="flex h-(--target-min) w-(--target-min) cursor-pointer items-center justify-center rounded-md border border-(--color-border-on-dark) bg-transparent p-0 text-(--color-text-on-dark) min-[901px]:hidden"
      >
        {open ? (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        ) : (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 6h14M3 10h14M3 14h14" />
          </svg>
        )}
      </button>

      <div
        ref={panelRef}
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-(--nav-height) overflow-y-auto bg-navy-900 min-[901px]:hidden"
      >
        <nav
          ref={contentRef}
          aria-label="Principal, móvil"
          className="mx-auto flex w-full max-w-(--container-max) flex-col px-(--space-gutter-x) pb-(--space-32) pt-(--space-8)"
        >
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              onClick={close}
              aria-current={current === l.id ? 'true' : undefined}
              className={`flex min-h-[52px] items-center border-b border-(--color-border-on-dark) text-(length:--text-body-lg) text-(--color-text-on-dark) no-underline ${
                current === l.id ? 'font-bold' : 'font-medium'
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href={contactHref}
            onClick={close}
            className="mt-(--space-24) flex min-h-(--target-min) items-center justify-center rounded-md bg-gradient-button-blue px-(--space-24) text-(length:--text-body-sm) font-semibold text-(--color-text-on-dark) no-underline"
          >
            Escríbeme
          </a>
        </nav>
      </div>
    </>
  );
}
