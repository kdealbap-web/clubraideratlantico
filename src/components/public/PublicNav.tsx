import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CLUB, ROUTES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { Logo } from '../chrome/Logo';
import { IconClose, IconWhatsApp } from '../icons';
import type { EventItem } from '../../types';

const LINKS: Array<{ to: string; label: string }> = [
  { to: ROUTES.home, label: 'Inicio' },
  { to: ROUTES.nosotros, label: 'El club' },
  { to: ROUTES.reglamento, label: 'Reglamento' },
  { to: ROUTES.eventos, label: 'Rodadas' },
  { to: ROUTES.cronograma, label: 'Cronograma' },
  { to: ROUTES.galeria, label: 'Galería' },
  { to: ROUTES.noticias, label: 'Noticias' },
  { to: ROUTES.unete, label: 'Únete' },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [nextEvent, setNextEvent] = useState<EventItem | null>(null);
  const loc = useLocation();

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, titulo, fecha, hora, salida, cupos, inscritos')
        .eq('estado', 'publicado')
        .gte('fecha', today)
        .order('fecha', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      setNextEvent((data as EventItem) ?? null);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <UtilityStrip event={nextEvent} />

      <header
        style={{
          padding: '14px 24px',
          background: 'var(--negro)',
          borderBottom: '1px solid var(--borde)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          transition: 'var(--theme-transition)',
          position: 'relative',
          zIndex: 50,
        }}
      >
        <Link to={ROUTES.home} style={{ textDecoration: 'none' }}>
          <Logo size={36} withWordmark={false} />
        </Link>

        <nav
          className="public-nav-links"
          style={{
            display: 'flex',
            gap: 22,
            fontFamily: 'var(--font-cond)',
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === ROUTES.home}
              style={({ isActive }) => ({
                color: isActive ? 'var(--rojo)' : 'var(--light)',
                textDecoration: 'none',
                paddingBottom: 2,
                borderBottom: isActive ? '1px solid var(--rojo)' : '1px solid transparent',
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div
          className="public-nav-actions"
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Link
            to={ROUTES.login}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--light)',
              textDecoration: 'none',
              padding: '8px 12px',
              border: '1px solid var(--borde)',
            }}
          >
            Acceso miembros
          </Link>
          <Link
            to={ROUTES.unete}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              padding: '10px 16px',
              textDecoration: 'none',
              clipPath: 'var(--clip-btn)',
            }}
          >
            Únete →
          </Link>
        </div>

        <button
          type="button"
          className="public-nav-hamburger"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          style={{
            width: 44,
            height: 44,
            background: 'var(--dark-2)',
            border: '1px solid var(--borde)',
            color: 'var(--blanco)',
            cursor: 'pointer',
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <span style={{ width: 18, height: 2, background: 'currentColor', display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'currentColor', display: 'block' }} />
          <span style={{ width: 18, height: 2, background: 'currentColor', display: 'block' }} />
        </button>
      </header>

      {open ? <MobileMenu onClose={() => setOpen(false)} /> : null}

      <style>{`
        @media (max-width: 980px) {
          .public-nav-links { display: none !important; }
          .public-nav-actions { display: none !important; }
          .public-nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function UtilityStrip({ event }: { event: EventItem | null }) {
  const txt = event
    ? `· Próxima rodada · ${fmtFechaCorta(event.fecha)} · ${event.titulo} · ${event.inscritos}/${event.cupos} cupos`
    : '· Comunidad sin ánimo de lucro · Caribe colombiano · membresía gratuita';

  const Content = (
    <>
      {event ? (
        <span
          style={{
            width: 6,
            height: 6,
            background: 'var(--blanco)',
            borderRadius: '50%',
            flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(255,255,255,0.25)',
          }}
          className="live-dot"
          aria-hidden="true"
        />
      ) : null}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {txt}
      </span>
    </>
  );

  return (
    <div
      style={{
        background: 'var(--rojo)',
        color: 'var(--blanco)',
        fontFamily: 'var(--font-cond)',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '8px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        overflow: 'hidden',
      }}
    >
      {event ? (
        <Link
          to={ROUTES.eventos}
          style={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden',
          }}
        >
          {Content}
        </Link>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
          {Content}
        </span>
      )}
      <span style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }} className="util-right">
        <a href={CLUB.social.whatsapp.url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
          WhatsApp
        </a>
        <a
          href={CLUB.social.instagram.url}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'inherit', textDecoration: 'none' }}
        >
          Instagram
        </a>
      </span>
      <style>{`
        @media (max-width: 600px) { .util-right { display: none !important; } }
      `}</style>
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menú móvil"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fade-in 0.2s ease both',
      }}
    >
      <header
        style={{
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--borde)',
        }}
      >
        <Logo size={36} withWordmark={false} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          style={{
            width: 44,
            height: 44,
            background: 'var(--dark-2)',
            border: '1px solid var(--borde)',
            color: 'var(--blanco)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <IconClose size={18} />
        </button>
      </header>

      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {LINKS.map((l, i) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === ROUTES.home}
            onClick={onClose}
            style={({ isActive }) => ({
              padding: '18px 16px',
              textDecoration: 'none',
              borderBottom: '1px solid var(--borde)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: isActive ? 'var(--rojo)' : 'var(--blanco)',
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              letterSpacing: '0.02em',
              animation: `fade-in-up 0.4s ease ${i * 0.05}s both`,
              background: isActive ? 'var(--rojo-soft)' : 'transparent',
            })}
          >
            <span>{l.label}</span>
            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
              }}
            >
              0{i + 1}
            </span>
          </NavLink>
        ))}
      </nav>

      <footer
        style={{
          padding: '20px 20px 28px',
          borderTop: '1px solid var(--borde)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to={ROUTES.login}
            onClick={onClose}
            style={{
              flex: 1,
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              textAlign: 'center',
              padding: '14px 18px',
              border: '1px solid var(--borde-strong)',
              textDecoration: 'none',
            }}
          >
            Acceso miembros
          </Link>
          <Link
            to={ROUTES.unete}
            onClick={onClose}
            style={{
              flex: 1,
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              textAlign: 'center',
              padding: '14px 18px',
              textDecoration: 'none',
              clipPath: 'var(--clip-btn)',
            }}
          >
            Únete →
          </Link>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTop: '1px solid var(--borde)',
          }}
        >
          <a
            href={CLUB.social.whatsapp.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#25D366',
              textDecoration: 'none',
            }}
          >
            <IconWhatsApp size={14} /> Grupo WhatsApp
          </a>
        </div>
      </footer>
    </div>
  );
}

function fmtFechaCorta(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' });
}
