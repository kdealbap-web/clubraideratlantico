import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/public/PublicLayout';
import { CronogramaPoster, MESES } from '../../components/cronograma/CronogramaPoster';
import { CumpleanosMes } from '../../components/cronograma/CumpleanosMes';
import { supabase } from '../../lib/supabase';
import { displayEstado } from '../../lib/eventStatus';
import { CLUB, ROUTES } from '../../lib/constants';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconRoute,
  IconWhatsApp,
} from '../../components/icons';
import type { EventItem, TipoEvento } from '../../types';

type FiltroTipo = 'Todos' | TipoEvento;
const FILTROS_TIPO: FiltroTipo[] = ['Todos', 'Rodada', 'Evento', 'Capacitación'];

export function CronogramaPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [filtro, setFiltro] = useState<FiltroTipo>('Todos');

  useEffect(() => {
    let active = true;
    (async () => {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .gte('fecha', start)
        .lte('fecha', end)
        .in('estado', ['publicado', 'realizado', 'cancelado'])
        .order('fecha', { ascending: true });
      if (!active) return;
      if (e) {
        setError(e.message);
        setEvents([]);
      } else {
        setEvents((data ?? []) as EventItem[]);
      }
    })();
    return () => {
      active = false;
    };
  }, [year, month]);

  const monthLabel = MESES[month - 1] ?? '';
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const monthsAheadOrBehind = (year - today.getFullYear()) * 12 + (month - 1 - today.getMonth());

  const counts = useMemo(() => {
    if (!events) return null;
    const map: Record<FiltroTipo, number> = {
      Todos: events.length,
      Rodada: 0,
      Evento: 0,
      Capacitación: 0,
    };
    for (const e of events) {
      if (e.tipo === 'Rodada' || e.tipo === 'Evento' || e.tipo === 'Capacitación') {
        map[e.tipo] += 1;
      }
    }
    return map;
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!events) return null;
    if (filtro === 'Todos') return events;
    return events.filter((e) => e.tipo === filtro);
  }, [events, filtro]);

  // Key para forzar re-mount con animación al cambiar mes/filtro
  const animKey = `${year}-${month}-${filtro}`;

  const navigate = (delta: number) => {
    let newM = month + delta;
    let newY = year;
    while (newM < 1) {
      newM += 12;
      newY -= 1;
    }
    while (newM > 12) {
      newM -= 12;
      newY += 1;
    }
    setMonth(newM);
    setYear(newY);
  };

  return (
    <PublicLayout>
      {/* HERO con título dinámico + navegador */}
      <section
        style={{
          position: 'relative',
          padding: '64px 32px 36px',
          borderBottom: '1px solid var(--borde)',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 70% 30%, rgba(204,34,34,0.25), transparent 60%)',
          }}
        />
        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative' }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            · Calendario público
          </div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(56px, 11vw, 156px)',
              lineHeight: 0.9,
              margin: 0,
              color: 'var(--blanco)',
            }}
          >
            Cronograma del{' '}
            <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>mes</span>.
          </h1>

          {/* Navegador de mes */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Mes anterior"
              style={navBtn}
            >
              <IconChevronLeft size={18} />
            </button>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minWidth: 260,
              }}
            >
              <div
                className="t-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  color: 'var(--blanco)',
                  lineHeight: 1,
                  textTransform: 'capitalize',
                }}
              >
                {monthLabel.toLowerCase()}
              </div>
              <div className="kicker">
                · {year} {isCurrentMonth ? '· mes actual' : monthsAheadOrBehind > 0 ? `· en ${monthsAheadOrBehind} mes${monthsAheadOrBehind > 1 ? 'es' : ''}` : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label="Mes siguiente"
              style={navBtn}
            >
              <IconChevronRight size={18} />
            </button>

            <div style={{ flex: 1 }} />

            <span
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                letterSpacing: '0.18em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
              }}
            >
              {filteredEvents?.length ?? 0} {filteredEvents?.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {/* Filtros por tipo */}
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            {FILTROS_TIPO.map((f) => {
              const active = filtro === f;
              const count = counts?.[f] ?? 0;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFiltro(f)}
                  style={{
                    padding: '8px 14px',
                    background: active ? 'var(--rojo)' : 'transparent',
                    color: active ? 'var(--blanco)' : 'var(--light)',
                    border: `1px solid ${active ? 'var(--rojo)' : 'var(--borde)'}`,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background .2s, color .2s, border-color .2s',
                  }}
                >
                  {f}
                  <span style={{ opacity: 0.6, fontSize: 10 }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error ? (
        <div style={{ padding: '32px' }}>
          <ErrorBox message={error} />
        </div>
      ) : (
        <section style={{ padding: '48px 32px 60px' }}>
          <div
            style={{
              maxWidth: 1320,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.92fr)',
              gap: 48,
              alignItems: 'flex-start',
            }}
            className="cronograma-grid"
          >
            {/* Columna lista interactiva */}
            <div
              key={animKey}
              className="crono-fade"
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <header style={{ marginBottom: 4 }}>
                <h2
                  className="t-display"
                  style={{ fontSize: 28, color: 'var(--blanco)', margin: 0 }}
                >
                  Agenda del mes
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
                  Click en cualquier evento para ver el detalle completo, inscribirte o
                  compartir.
                </p>
              </header>

              {filteredEvents === null ? (
                <Loading />
              ) : filteredEvents.length === 0 ? (
                <EmptyState
                  icon={<IconCalendar size={24} />}
                  title={
                    filtro === 'Todos'
                      ? `Aún no hay eventos publicados para ${monthLabel.toLowerCase()}`
                      : `Sin eventos de tipo "${filtro}" en ${monthLabel.toLowerCase()}`
                  }
                  body={
                    filtro === 'Todos'
                      ? 'El comité publica el cronograma con anticipación. Vuelve pronto o navega entre meses.'
                      : "Cambia el filtro arriba a 'Todos' para ver los demás eventos del mes."
                  }
                />
              ) : (
                filteredEvents.map((ev) => (
                  <PublicEventRow
                    key={ev.id}
                    ev={ev}
                    onClick={() => setSelected(ev)}
                  />
                ))
              )}

              <div
                style={{
                  marginTop: 18,
                  padding: 18,
                  border: '1px solid var(--borde)',
                  background: 'var(--dark-1)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div>
                  <div className="kicker">· Comparte este mes</div>
                  <p
                    style={{
                      color: 'var(--light)',
                      fontSize: 13,
                      margin: '4px 0 0',
                      maxWidth: 360,
                    }}
                  >
                    Envía el cronograma a tu grupo de WhatsApp o súbelo a tu historia de
                    Instagram.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🏍️ Cronograma ${monthLabel} ${year} · Club Raider Atlántico\n${CLUB.web}/cronograma`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={waBtn}
                  >
                    <IconWhatsApp size={14} /> WhatsApp
                  </a>
                  <a
                    href={CLUB.social.instagram.url}
                    target="_blank"
                    rel="noreferrer"
                    style={igBtn}
                  >
                    Instagram →
                  </a>
                </div>
              </div>

              <CumpleanosMes month={month} variant="public" />
            </div>

            {/* Columna poster preview */}
            <div
              style={{
                position: 'sticky',
                top: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
              className="cronograma-poster-col"
            >
              <div className="kicker">· Poster del mes</div>
              <div
                key={animKey}
                className="crono-fade"
                style={{
                  width: '100%',
                  maxWidth: 540,
                  display: 'flex',
                  justifyContent: 'center',
                  background: 'var(--dark-2)',
                  border: '1px solid var(--borde)',
                  overflow: 'hidden',
                  padding: 14,
                }}
              >
                <CronogramaPoster
                  mes={monthLabel}
                  monthNum={month}
                  year={year}
                  events={filteredEvents ?? []}
                  responsive
                />
              </div>
              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: 12,
                  textAlign: 'center',
                  margin: 0,
                  maxWidth: 480,
                }}
              >
                Versión exportable 1080×1920. El comité puede descargar la imagen desde el panel
                administrativo y compartirla en redes.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA strip */}
      <section
        style={{
          padding: '52px 32px',
          borderTop: '1px solid var(--borde)',
          background: 'linear-gradient(135deg, var(--dark-1), var(--negro))',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <div className="kicker">· ¿Quieres rodar?</div>
            <h3
              className="t-display"
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                color: 'var(--blanco)',
                lineHeight: 1,
                margin: '8px 0 12px',
              }}
            >
              Inscríbete a una rodada del mes.
            </h3>
            <p style={{ color: 'var(--light)', fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
              Si ya eres miembro, escribe al líder de ruta directo. Si no lo eres aún, puedes
              acompañar como invitado cumpliendo equipo y documentos.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to={ROUTES.eventos} style={btnPrimary}>
              Ver todos los eventos
            </Link>
            <Link to={ROUTES.unete} style={btnGhost}>
              Solicitar ingreso
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 920px) {
          .cronograma-grid { grid-template-columns: 1fr !important; }
          .cronograma-poster-col { position: static !important; order: -1; }
        }
        .crono-fade {
          animation: crono-fade-in 0.45s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes crono-fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <EventDrawerSlim event={selected} onClose={() => setSelected(null)} />
    </PublicLayout>
  );
}

// ─── Row interactivo de la lista ─────────────────────────────────────────
function PublicEventRow({ ev, onClick }: { ev: EventItem; onClick: () => void }) {
  const d = new Date(ev.fecha);
  const dia = Number.isNaN(d.getTime()) ? '—' : String(d.getUTCDate()).padStart(2, '0');
  const dow = Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-CO', { weekday: 'short', timeZone: 'UTC' })
        .replace('.', '')
        .toUpperCase();
  const estado = displayEstado(ev);
  const realizado = estado === 'realizado';
  const cancelado = estado === 'cancelado';
  const cupoFull = ev.inscritos >= ev.cupos && ev.cupos > 0 && !realizado && !cancelado;

  return (
    <article
      onClick={onClick}
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: '16px 18px',
        display: 'grid',
        gridTemplateColumns: '92px 1fr auto',
        gap: 16,
        alignItems: 'center',
        cursor: 'pointer',
        opacity: cancelado ? 0.72 : 1,
        transition: 'transform .22s, border-color .22s, box-shadow .22s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          background: realizado || cancelado ? 'var(--dark-2)' : 'var(--rojo)',
          color: 'var(--blanco)',
          padding: '12px 0',
          textAlign: 'center',
          fontFamily: 'var(--font-cond)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 700,
          borderRadius: 999,
          fontSize: 14,
          lineHeight: 1.1,
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: '0.18em' }}>{dow}</div>
        <div style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>{dia}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, gap: 4 }}>
        <div
          className="t-display"
          style={{
            fontSize: 19,
            color: cancelado ? 'var(--light)' : 'var(--blanco)',
            lineHeight: 1.1,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            textDecoration: cancelado ? 'line-through' : 'none',
          }}
        >
          {ev.titulo}
        </div>
        <div
          style={{
            color: 'var(--rojo)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {ev.salida}
          {ev.hora ? ` · ${ev.hora}` : ''}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {cancelado ? <StatusBadge label="Cancelado" tone="cancel" /> : null}
        {realizado ? <StatusBadge label="Realizado" tone="done" /> : null}
        {cupoFull ? (
          <span
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '4px 8px',
              background: 'var(--warn)',
              color: 'var(--negro)',
              fontWeight: 700,
            }}
          >
            Lleno
          </span>
        ) : null}
        <span
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            color: 'var(--light)',
            letterSpacing: '0.06em',
          }}
        >
          {ev.inscritos}/{ev.cupos}
        </span>
        <IconChevronRight size={16} style={{ color: 'var(--rojo)' }} />
      </div>
    </article>
  );
}

// ─── Drawer compacto (subset de Eventos.tsx) ─────────────────────────────
function EventDrawerSlim({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
  useEffect(() => {
    if (!event) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  if (!event) return null;

  const mapsUrl =
    event.ubicacion_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.salida)}`;
  const shareText = `🏍️ ${event.titulo}\n📅 ${event.fecha} · ${event.hora}\n📍 ${event.salida}\n${event.descripcion}\n\n${CLUB.web}/eventos`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const inscripcionWa = event.contacto_tel
    ? `https://wa.me/${event.contacto_tel.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hola, quiero inscribirme en "${event.titulo}".`,
      )}`
    : CLUB.social.whatsapp.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 720,
          background: 'var(--negro)',
          borderLeft: '1px solid var(--borde)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            height: 220,
            background: event.cover_url
              ? `url('${event.cover_url}') center/cover`
              : 'linear-gradient(135deg, var(--imgph-1), var(--imgph-3))',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.96) 100%)',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 38,
              height: 38,
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'var(--blanco)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <IconClose size={14} />
          </button>
          <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22 }}>
            <h2
              className="t-display"
              style={{
                fontSize: 'clamp(26px, 4vw, 36px)',
                color: 'var(--blanco)',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {event.titulo}
            </h2>
            <div className="kicker" style={{ marginTop: 4 }}>
              · {event.fecha} · {event.hora}
            </div>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 22px' }}>
          <p style={{ color: 'var(--light)', fontSize: 14.5, lineHeight: 1.65, margin: '0 0 18px' }}>
            {event.descripcion}
          </p>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: '14px 16px',
              background: 'var(--dark-1)',
              border: '1px solid var(--borde)',
              color: 'var(--blanco)',
              textDecoration: 'none',
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                background: 'var(--rojo-soft)',
                color: 'var(--rojo)',
                border: '1px solid var(--rojo)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <IconRoute size={18} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>{event.salida}</div>
              <div className="kicker" style={{ fontSize: 10, marginTop: 4 }}>
                · Ver en Google Maps →
              </div>
            </div>
          </a>

          {event.recomendaciones ? (
            <div
              style={{
                padding: '14px 16px',
                background:
                  'linear-gradient(135deg, rgba(204,34,34,0.08), rgba(204,34,34,0.02))',
                border: '1px solid var(--rojo)',
                borderLeft: '3px solid var(--rojo)',
                color: 'var(--blanco)',
                fontSize: 13.5,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                marginBottom: 14,
              }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                · Recomendaciones del líder
              </div>
              {event.recomendaciones}
            </div>
          ) : null}

          {event.requisitos ? (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--rojo-soft)',
                border: '1px solid var(--rojo)',
                color: 'var(--blanco)',
                fontSize: 13.5,
                lineHeight: 1.55,
                whiteSpace: 'pre-line',
                marginBottom: 14,
              }}
            >
              <strong style={{ color: 'var(--rojo)' }}>⚠ Requisito: </strong>
              {event.requisitos}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href={waShare} target="_blank" rel="noreferrer" style={waBtn}>
              <IconWhatsApp size={14} /> Compartir
            </a>
            <Link to={ROUTES.eventos} style={ghostMiniBtn}>
              Ver evento completo →
            </Link>
          </div>
        </div>

        <div
          style={{
            padding: '14px 22px',
            background: 'var(--dark-1)',
            borderTop: '1px solid var(--borde)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--light)' }}>
            {event.inscritos}/{event.cupos} cupos
          </div>
          <a
            href={inscripcionWa}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 20px',
              background: 'var(--rojo)',
              color: 'var(--blanco)',
              textDecoration: 'none',
              fontFamily: 'var(--font-cond)',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontWeight: 700,
              clipPath: 'var(--clip-btn)',
            }}
          >
            Inscribirme →
          </a>
        </div>
      </aside>
    </div>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: 'cancel' | 'done' }) {
  const cancel = tone === 'cancel';
  return (
    <span
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 10,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '4px 8px',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: cancel ? 'var(--rojo-soft)' : 'var(--dark-2)',
        color: cancel ? 'var(--rojo-light)' : 'var(--light)',
        border: `1px solid ${cancel ? 'var(--rojo)' : 'var(--borde-strong)'}`,
      }}
    >
      {cancel ? '✕ ' : '✓ '}
      {label}
    </span>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        border: '1px solid var(--rojo)',
        background: 'var(--rojo-soft)',
        color: 'var(--rojo-light)',
        padding: '14px 16px',
        fontSize: 13,
      }}
    >
      Supabase: {message}
    </div>
  );
}

function Loading() {
  return (
    <div
      style={{
        border: '1px dashed var(--borde)',
        padding: 24,
        color: 'var(--muted)',
        fontFamily: 'var(--font-cond)',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontSize: 12,
      }}
    >
      Cargando agenda…
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  border: '1px solid var(--borde)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};

const btnPrimary: React.CSSProperties = {
  fontFamily: 'var(--font-cond)',
  fontSize: 13,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'var(--blanco)',
  background: 'var(--rojo)',
  padding: '14px 22px',
  textDecoration: 'none',
  clipPath: 'var(--clip-btn)',
};

const btnGhost: React.CSSProperties = {
  ...btnPrimary,
  background: 'transparent',
  border: '1px solid var(--borde-strong)',
};

const waBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: '#25D366',
  color: '#fff',
  padding: '10px 16px',
  textDecoration: 'none',
  fontFamily: 'var(--font-cond)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const igBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background:
    'linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)',
  color: '#fff',
  padding: '10px 16px',
  textDecoration: 'none',
  fontFamily: 'var(--font-cond)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const ghostMiniBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  background: 'var(--dark-2)',
  color: 'var(--blanco)',
  padding: '10px 16px',
  border: '1px solid var(--borde-strong)',
  cursor: 'pointer',
  fontFamily: 'var(--font-cond)',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fontWeight: 600,
  textDecoration: 'none',
};
