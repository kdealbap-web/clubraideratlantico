import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PublicLayout } from '../../components/public/PublicLayout';
import { supabase } from '../../lib/supabase';
import { EmptyState, EMPTY_TEXTS } from '../../components/ui/EmptyState';
import { CoverImage } from '../../components/ui/CoverImage';
import { RodadaVideos } from '../../components/media/RodadaVideos';
import type { EventItem, TipoEvento } from '../../types';
import { CLUB, ROUTES } from '../../lib/constants';
import {
  IconCalendar,
  IconClose,
  IconRoute,
  IconWhatsApp,
} from '../../components/icons';

type Filtro = 'Todos' | TipoEvento;
const FILTROS: Filtro[] = ['Todos', 'Rodada', 'Evento', 'Capacitación'];

export function EventosPage() {
  const params = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('Todos');

  // El detalle abierto se deriva de la URL (/eventos/:id). Esto permite
  // compartir el link directo a una rodada y que abra el drawer.

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('events')
        .select('*')
        .in('estado', ['publicado', 'realizado'])
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
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const selected = useMemo<EventItem | null>(() => {
    if (!params.id || !events) return null;
    return events.find((e) => e.id === params.id) ?? null;
  }, [params.id, events]);

  const filtered = useMemo(() => {
    if (!events) return null;
    return filtro === 'Todos' ? events : events.filter((e) => e.tipo === filtro);
  }, [events, filtro]);

  const counts = useMemo(() => {
    if (!events) return null;
    const map: Record<Filtro, number> = {
      Todos: events.length,
      Rodada: 0,
      Evento: 0,
      Capacitación: 0,
    };
    for (const e of events) map[e.tipo as Filtro] = (map[e.tipo as Filtro] || 0) + 1;
    return map;
  }, [events]);

  const next = useMemo(() => {
    if (!filtered) return null;
    return (
      filtered.find((e) => e.fecha >= today && e.estado === 'publicado') ?? filtered[0] ?? null
    );
  }, [filtered, today]);

  const rest = useMemo(() => {
    if (!filtered) return null;
    const withoutNext = next ? filtered.filter((e) => e.id !== next.id) : filtered;
    // Próximas primero (fecha más cercana arriba); las ya pasadas al final
    // (más reciente primero).
    const upcoming = withoutNext
      .filter((e) => e.fecha >= today)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    const past = withoutNext
      .filter((e) => e.fecha < today)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return [...upcoming, ...past];
  }, [filtered, next, today]);

  const stats = useMemo(() => {
    if (!events) return null;
    return {
      total: events.length,
      kmTotal: events.reduce((a, e) => a + (e.km || 0), 0),
      kmMax: events.reduce((a, e) => Math.max(a, e.km || 0), 0),
      cuposLibres: events.reduce((a, e) => a + Math.max(0, e.cupos - e.inscritos), 0),
    };
  }, [events]);

  return (
    <PublicLayout>
      <section
        style={{
          padding: '88px 32px 56px',
          borderBottom: '1px solid var(--borde)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 80% 30%, rgba(204,34,34,0.22), transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative' }}>
          <div className="kicker" style={{ marginBottom: 12 }}>
            · Agenda {new Date().getFullYear()} · Temporada activa
          </div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(56px, 10vw, 144px)',
              color: 'var(--blanco)',
              lineHeight: 0.85,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Eventos
            <br />
            <span style={{ color: 'var(--rojo)' }}>&</span> rodadas.
          </h1>
          <p
            style={{
              color: 'var(--light)',
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 580,
              marginTop: 28,
            }}
          >
            Calendario oficial del club. Click en cualquier rodada para ver el detalle completo,
            punto de salida, requisitos y compartir.
          </p>

          {stats ? (
            <div
              style={{
                marginTop: 44,
                maxWidth: 800,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                border: '1px solid var(--borde)',
                background: 'rgba(10,10,10,0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <StatCell v={String(stats.total)} l={`${stats.total === 1 ? 'evento' : 'eventos'} publicados`} />
              <StatCell v={stats.kmMax > 0 ? `${stats.kmMax}` : '—'} l="KM ruta más larga" />
              <StatCell v={stats.kmTotal > 0 ? stats.kmTotal.toLocaleString('es-CO') : '—'} l="KM totales" />
              <StatCell v={String(stats.cuposLibres)} l="Cupos disponibles" last />
            </div>
          ) : null}
        </div>
      </section>

      <section
        style={{
          padding: '16px 32px',
          borderBottom: '1px solid var(--borde)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(10,10,10,0.94)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {FILTROS.map((f) => {
            const count = counts?.[f] ?? 0;
            const active = filtro === f;
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
                }}
              >
                {f}
                <span style={{ opacity: 0.6, fontSize: 10 }}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {error ? (
        <div style={{ padding: '32px' }}>
          <ErrorBox message={error} />
        </div>
      ) : filtered === null ? (
        <div style={{ padding: '40px 32px' }}>
          <Loading />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px 32px' }}>
          <EmptyState
            icon={<IconCalendar size={24} />}
            title={EMPTY_TEXTS.events.title}
            body={EMPTY_TEXTS.events.body}
          />
        </div>
      ) : (
        <>
          {next ? (
            <section style={{ padding: '60px 32px', borderBottom: '1px solid var(--borde)' }}>
              <div style={{ maxWidth: 1320, margin: '0 auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span
                      className="live-dot"
                      style={{
                        width: 8,
                        height: 8,
                        background: 'var(--rojo)',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 4px rgba(204,34,34,0.2)',
                      }}
                    />
                    <span className="kicker" style={{ margin: 0 }}>
                      Próximo · inscripciones abiertas
                    </span>
                  </div>
                  <CountdownPill date={next.fecha} />
                </div>
                <FeaturedEvent event={next} onOpen={() => navigate(`${ROUTES.eventos}/${next.id}`)} />
              </div>
            </section>
          ) : null}

          {rest && rest.length > 0 ? (
            <section style={{ padding: '52px 32px' }}>
              <div style={{ maxWidth: 1320, margin: '0 auto' }}>
                <div className="kicker" style={{ marginBottom: 20 }}>
                  · Resto del calendario · {rest.length} {rest.length === 1 ? 'evento' : 'eventos'}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: 16,
                  }}
                >
                  {rest.map((ev) => (
                    <EventCard key={ev.id} ev={ev} onClick={() => navigate(`${ROUTES.eventos}/${ev.id}`)} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      <section
        style={{
          padding: '60px 32px',
          borderTop: '1px solid var(--borde)',
          background: 'linear-gradient(135deg, var(--dark-1), var(--negro))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            background: 'radial-gradient(circle, rgba(204,34,34,0.15), transparent 70%)',
          }}
        />
        <div
          style={{
            maxWidth: 1320,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
            position: 'relative',
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <div className="kicker">· ¿Eres invitado?</div>
            <h3
              className="t-display"
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                color: 'var(--blanco)',
                lineHeight: 0.95,
                margin: '8px 0 12px',
              }}
            >
              Rueda con nosotros antes de unirte.
            </h3>
            <p style={{ color: 'var(--light)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Si no eres miembro aún, puedes acompañar rodadas cumpliendo equipo + documentos.
              Después solicitas tu ingreso si te gusta el grupo.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to={ROUTES.unete} style={btnPrimary}>
              Solicitar ingreso
            </Link>
            <Link to={ROUTES.reglamento} style={btnGhost}>
              Ver reglamento
            </Link>
          </div>
        </div>
      </section>

      <EventDrawer event={selected} onClose={() => navigate(ROUTES.eventos)} />
    </PublicLayout>
  );
}

function StatCell({ v, l, last = false }: { v: string; l: string; last?: boolean }) {
  return (
    <div
      style={{
        padding: '20px 16px',
        borderRight: last ? 'none' : '1px solid var(--borde)',
        textAlign: 'center',
      }}
    >
      <div
        className="t-display"
        style={{ fontSize: 36, color: 'var(--blanco)', lineHeight: 1 }}
      >
        {v}
      </div>
      <div className="kicker" style={{ fontSize: 9, marginTop: 6 }}>
        {l}
      </div>
    </div>
  );
}

function CountdownPill({ date }: { date: string }) {
  const target = new Date(date);
  const days = Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000));
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--negro)',
        border: '1px solid var(--rojo)',
        padding: '6px 14px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Faltan
      </span>
      <span
        className="t-display"
        style={{ fontSize: 18, color: 'var(--rojo)', fontVariantNumeric: 'tabular-nums' }}
      >
        {days}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        {days === 1 ? 'día' : 'días'}
      </span>
    </div>
  );
}

function FeaturedEvent({ event, onOpen }: { event: EventItem; onOpen: () => void }) {
  const { day, month, year } = parseFechaParts(event.fecha);
  const pct = event.cupos > 0 ? Math.round((event.inscritos / event.cupos) * 100) : 0;

  return (
    <article
      onClick={onOpen}
      className="featured-event"
      style={{
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
        minHeight: 480,
        cursor: 'pointer',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <CoverImage url={event.cover_url} alt={event.titulo} minHeight={320}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, transparent 40%, rgba(204,34,34,0.18) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            background: 'var(--negro)',
            border: '3px solid var(--rojo)',
            padding: '18px 24px',
            textAlign: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <div className="t-display" style={{ fontSize: 56, color: 'var(--blanco)', lineHeight: 1 }}>
            {day}
          </div>
          <div className="kicker" style={{ marginTop: 4, fontSize: 12 }}>
            {month}
          </div>
          <div style={{ height: 1, background: 'var(--borde)', margin: '8px 0' }} aria-hidden="true" />
          <div
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              color: 'var(--light)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {year}
          </div>
        </div>
      </CoverImage>

      <div
        style={{
          padding: 36,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <Badge red>{event.tipo}</Badge>
            <Badge>Dificultad {event.dificultad}</Badge>
            {event.km > 0 ? <Badge>{event.km} km</Badge> : null}
          </div>
          <h2
            className="t-display"
            style={{
              fontSize: 'clamp(28px, 3vw, 44px)',
              color: 'var(--blanco)',
              lineHeight: 0.95,
              letterSpacing: '-0.01em',
              margin: '0 0 14px',
            }}
          >
            {event.titulo}
          </h2>
          <p
            style={{
              color: 'var(--light)',
              fontSize: 15,
              lineHeight: 1.6,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {event.descripcion}
          </p>
        </div>

        <div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
                fontSize: 12,
                color: 'var(--light)',
              }}
            >
              <span>
                {event.inscritos} / {event.cupos} cupos
              </span>
              <span style={{ color: pct >= 90 ? 'var(--warn)' : 'var(--success)' }}>
                {Math.max(0, event.cupos - event.inscritos)} libres
              </span>
            </div>
            <div
              style={{
                height: 4,
                background: 'var(--dark-2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${pct}%`,
                  background: pct >= 90 ? 'var(--warn)' : 'var(--rojo)',
                  transition: 'width .35s',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <IconRoute size={16} style={{ color: 'var(--rojo)' }} />
            <div
              style={{
                color: 'var(--blanco)',
                fontSize: 13.5,
                lineHeight: 1.4,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.salida}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            style={{
              fontFamily: 'var(--font-cond)',
              fontSize: 13,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--blanco)',
              background: 'var(--rojo)',
              padding: '14px 22px',
              border: 'none',
              cursor: 'pointer',
              clipPath: 'var(--clip-btn-l)',
              width: '100%',
              fontWeight: 700,
            }}
          >
            Ver detalle e inscribirme →
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) {
          .featured-event { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </article>
  );
}

function EventCard({ ev, onClick }: { ev: EventItem; onClick: () => void }) {
  const realizado = ev.estado === 'realizado';
  const cupoFull = ev.inscritos >= ev.cupos && ev.cupos > 0;

  return (
    <article
      onClick={onClick}
      style={{
        cursor: 'pointer',
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <CoverImage url={ev.cover_url} alt={ev.titulo} ratio={56}>
        {!ev.cover_url ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              color: 'var(--muted)',
            }}
          >
            <IconCalendar size={42} />
          </div>
        ) : null}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '6px 10px',
            background: realizado ? 'var(--dark-2)' : 'var(--rojo)',
            color: 'var(--blanco)',
            fontFamily: 'var(--font-cond)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          {ev.estado}
        </div>
        {cupoFull && !realizado ? (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '6px 10px',
              background: 'var(--warn)',
              color: 'var(--negro)',
              fontFamily: 'var(--font-cond)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Cupos llenos
          </div>
        ) : null}
      </CoverImage>

      <div
        style={{
          padding: '18px 18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            color: 'var(--rojo)',
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          <span>{fmtFecha(ev.fecha)}</span>
          <span style={{ color: 'var(--muted)' }}>·</span>
          <span style={{ color: 'var(--light)' }}>{ev.hora}</span>
        </div>
        <h3
          className="t-display"
          style={{ fontSize: 22, color: 'var(--blanco)', margin: 0, lineHeight: 1.05 }}
        >
          {ev.titulo}
        </h3>
        <p
          style={{
            color: 'var(--light)',
            fontSize: 13,
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {ev.descripcion}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            marginTop: 'auto',
            paddingTop: 8,
          }}
        >
          <Badge>{ev.tipo}</Badge>
          <Badge>{ev.dificultad}</Badge>
          {ev.km > 0 ? <Badge>{ev.km} km</Badge> : null}
          <Badge red>
            {ev.inscritos}/{ev.cupos}
          </Badge>
        </div>
      </div>
    </article>
  );
}

function Badge({ children, red = false }: { children: React.ReactNode; red?: boolean }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 10,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        padding: '4px 9px',
        background: red ? 'var(--rojo)' : 'rgba(255,255,255,0.08)',
        color: red ? 'var(--blanco)' : 'var(--light)',
        fontWeight: 600,
        border: red ? 'none' : '1px solid var(--borde)',
      }}
    >
      {children}
    </span>
  );
}

function EventDrawer({ event, onClose }: { event: EventItem | null; onClose: () => void }) {
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
  const shareOrigin = typeof window !== 'undefined' ? window.location.origin : CLUB.web;
  const shareText = `🏍️ ${event.titulo}\n📅 ${fmtFecha(event.fecha)} · ${event.hora}\n📍 ${event.salida}\n${event.descripcion}\n\nInscríbete: ${shareOrigin}${ROUTES.eventos}/${event.id}`;
  const waShare = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const realizado = event.estado === 'realizado';
  const cupoFull = event.inscritos >= event.cupos && event.cupos > 0;
  const cuposLibres = Math.max(0, event.cupos - event.inscritos);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    } catch {
      /* ignore */
    }
  };

  // Normaliza el número para wa.me: los móviles colombianos locales (10 dígitos
  // que empiezan por 3) necesitan el indicativo 57, si no WhatsApp da "número no válido".
  const telDigits = event.contacto_tel ? event.contacto_tel.replace(/\D/g, '') : '';
  const telWa =
    telDigits.length === 10 && telDigits.startsWith('3') ? `57${telDigits}` : telDigits;
  const inscripcionWa = telWa
    ? `https://wa.me/${telWa}?text=${encodeURIComponent(
        `Hola, quiero inscribirme en "${event.titulo}" del ${fmtFecha(event.fecha)}.`,
      )}`
    : CLUB.social.whatsapp.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.titulo}
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
          maxWidth: 760,
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
            height: 260,
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
              background: 'linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.96) 100%)',
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
          <div
            style={{
              position: 'absolute',
              bottom: 18,
              left: 22,
              right: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge red>{event.estado}</Badge>
              <Badge>{event.tipo}</Badge>
              <Badge>{event.dificultad}</Badge>
            </div>
            <h2
              className="t-display"
              style={{
                fontSize: 'clamp(28px, 4vw, 38px)',
                color: 'var(--blanco)',
                margin: 0,
                lineHeight: 1.05,
              }}
            >
              {event.titulo}
            </h2>
          </div>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 22px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              border: '1px solid var(--borde)',
              marginBottom: 22,
            }}
          >
            <DataCell label="Fecha" value={fmtFechaLarga(event.fecha)} />
            <DataCell label="Hora" value={event.hora} />
            <DataCell label="Cupos" value={`${event.inscritos}/${event.cupos}`} />
            {event.km > 0 ? <DataCell label="Distancia" value={`${event.km} km`} /> : null}
          </div>

          <DSection title="Sobre la rodada">
            <p style={{ color: 'var(--light)', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>
              {event.descripcion}
            </p>
          </DSection>

          <DSection title="Punto de salida">
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '14px 16px',
                background: 'var(--dark-1)',
                border: '1px solid var(--borde)',
              }}
            >
              <div
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
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'var(--blanco)', fontSize: 14, lineHeight: 1.5 }}>
                  {event.salida}
                </div>
                {event.ruta ? (
                  <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
                    Ruta: {event.ruta}
                  </div>
                ) : null}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--rojo)',
                    fontFamily: 'var(--font-cond)',
                    fontSize: 11,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Ver en Google Maps →
                </a>
              </div>
            </div>
          </DSection>

          {event.recomendaciones ? (
            <DSection title="Recomendaciones del líder">
              <div
                style={{
                  padding: '16px 18px',
                  background:
                    'linear-gradient(135deg, rgba(204,34,34,0.08), rgba(204,34,34,0.02))',
                  border: '1px solid var(--rojo)',
                  borderLeft: '3px solid var(--rojo)',
                  color: 'var(--blanco)',
                  fontSize: 14,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-line',
                }}
              >
                {event.recomendaciones}
              </div>
            </DSection>
          ) : null}

          <RodadaVideos eventId={event.id} />

          {event.que_llevar ? (
            <DSection title="Qué llevar">
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--dark-1)',
                  border: '1px solid var(--borde)',
                }}
              >
                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                  {event.que_llevar
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((item, i) => (
                      <li
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          padding: '8px 0',
                          borderBottom: '1px dashed var(--borde)',
                          color: 'var(--blanco)',
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            width: 20,
                            height: 20,
                            background: 'var(--success)',
                            color: 'var(--negro)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                </ul>
              </div>
            </DSection>
          ) : null}

          {event.requisitos ? (
            <DSection title="Requisitos especiales (obligatorios)">
              <div
                style={{
                  padding: '14px 18px',
                  background: 'var(--rojo-soft)',
                  border: '1px solid var(--rojo)',
                  color: 'var(--blanco)',
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                <strong style={{ color: 'var(--rojo)' }}>⚠ </strong>
                {event.requisitos}
              </div>
            </DSection>
          ) : null}

          <DSection title="Reglas estándar del club">
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {[
                'Asistencia obligatoria al briefing antes de la salida',
                'Equipo mínimo: casco certificado, chaqueta, guantes, calzado cerrado',
                'Documentos al día (licencia, SOAT, tecnomecánica). Sin papeles, no hay ruta',
                'Prohibido alcohol o sustancias antes y durante la rodada',
                'Distancia mínima 2 segundos entre motos, formación en zigzag',
              ].map((rule, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    color: 'var(--light)',
                    fontSize: 13.5,
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-cond)',
                      color: 'var(--rojo)',
                      fontWeight: 700,
                      fontSize: 12,
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </DSection>

          {(event.contacto_lider || event.contacto_tel) ? (
            <DSection title="Líder de ruta">
              <div
                style={{
                  padding: '14px 16px',
                  background: 'var(--dark-1)',
                  border: '1px solid var(--borde)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ color: 'var(--blanco)', fontWeight: 600 }}>
                    {event.contacto_lider ?? 'Líder asignado'}
                  </div>
                  {event.contacto_tel ? (
                    <div style={{ color: 'var(--light)', fontSize: 13 }}>{event.contacto_tel}</div>
                  ) : null}
                </div>
                {event.contacto_tel ? (
                  <a
                    href={`https://wa.me/${event.contacto_tel.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={waButton}
                  >
                    <IconWhatsApp size={14} /> Escribir
                  </a>
                ) : null}
              </div>
            </DSection>
          ) : null}

          <DSection title="Comparte esta rodada">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={waShare} target="_blank" rel="noreferrer" style={waButton}>
                <IconWhatsApp size={14} /> WhatsApp
              </a>
              <button type="button" onClick={() => void copyLink()} style={ghostMiniBtn}>
                Copiar link
              </button>
            </div>
          </DSection>
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
            {realizado
              ? 'Rodada finalizada · revisa la galería'
              : cupoFull
                ? 'Cupos llenos · únete a la lista de espera'
                : `${cuposLibres} cupos disponibles`}
          </div>
          <a
            href={inscripcionWa}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '12px 22px',
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
            {realizado ? 'Próxima rodada →' : 'Inscribirme →'}
          </a>
        </div>
      </aside>
    </div>
  );
}

function DSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h3 className="kicker" style={{ fontSize: 11, margin: '0 0 10px' }}>
        · {title}
      </h3>
      {children}
    </section>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRight: '1px solid var(--borde)',
        background: 'var(--dark-1)',
      }}
    >
      <div className="kicker" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: 'var(--blanco)', fontSize: 13.5, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function parseFechaParts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '—', month: '—', year: '—' };
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    month: d.toLocaleDateString('es-CO', { month: 'short', timeZone: 'UTC' }).toUpperCase().replace('.', ''),
    year: String(d.getUTCFullYear()),
  };
}

function fmtFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function fmtFechaLarga(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
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
      Cargando eventos…
    </div>
  );
}

const btnPrimary = {
  fontFamily: 'var(--font-cond)',
  fontSize: 13,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: 'var(--blanco)',
  background: 'var(--rojo)',
  padding: '14px 22px',
  textDecoration: 'none',
  clipPath: 'var(--clip-btn)',
};

const btnGhost = {
  ...btnPrimary,
  background: 'transparent',
  border: '1px solid var(--borde-strong)',
};

const waButton = {
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
  textTransform: 'uppercase' as const,
  fontWeight: 600,
};

const ghostMiniBtn = {
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
  textTransform: 'uppercase' as const,
  fontWeight: 600,
};
