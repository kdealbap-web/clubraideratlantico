import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PublicLayout } from '../../components/public/PublicLayout';
import { supabase } from '../../lib/supabase';
import { GRUPOS_COMITE, type GrupoComite, type Member } from '../../types';
import { EmptyState } from '../../components/ui/EmptyState';
import { ROUTES } from '../../lib/constants';

export function NosotrosPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('members')
        .select(
          'id, nombre, apellido, alias, rol, ciudad, moto_marca, moto_modelo, moto_color, moto_placa, ingreso, grupo, cargo, num, desde, foto_url',
        )
        .eq('estado', 'activo')
        .in('rol', ['ADMINISTRADOR', 'LIDER', 'EDITOR', 'PILOTO_OFICIAL'])
        .order('num', { ascending: true, nullsFirst: false })
        .order('apellido', { ascending: true });
      if (!active) return;
      if (e) {
        setError(e.message);
        setMembers([]);
      } else {
        setMembers((data ?? []) as Member[]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Agrupar miembros según su sub-grupo (lideres/disciplina/ruta/contenido)
  // y dejar el resto como Pilotos Oficiales.
  const grouped = useMemo(() => {
    if (!members) return null;
    const byGrupo: Record<GrupoComite, Member[]> = {
      lideres: [],
      disciplina: [],
      ruta: [],
      contenido: [],
    };
    const pilotos: Member[] = [];
    for (const m of members) {
      if (m.grupo && m.grupo in byGrupo) {
        byGrupo[m.grupo].push(m);
      } else {
        pilotos.push(m);
      }
    }
    return { byGrupo, pilotos };
  }, [members]);

  const totals = useMemo(() => {
    if (!members) return null;
    return {
      activos: members.length,
      desde: 2022,
      anios: new Date().getFullYear() - 2022,
    };
  }, [members]);

  return (
    <PublicLayout>
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          padding: '88px 32px 64px',
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
              'radial-gradient(ellipse at 80% 30%, rgba(204,34,34,0.18), transparent 60%)',
          }}
        />
        <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative' }}>
          <div className="kicker" style={{ marginBottom: 14 }}>
            · Quiénes somos
          </div>
          <h1
            className="t-display"
            style={{
              fontSize: 'clamp(56px, 11vw, 156px)',
              lineHeight: 0.92,
              margin: 0,
              color: 'var(--blanco)',
            }}
          >
            El club <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>en personas</span>.
          </h1>
          <p
            style={{
              marginTop: 24,
              maxWidth: 720,
              fontSize: 17,
              lineHeight: 1.55,
              color: 'var(--light)',
            }}
          >
            Más que un club. Una hermandad construida desde 2022 sobre dos ruedas.
          </p>
        </div>
      </section>

      {/* MISIÓN + VISIÓN */}
      <MisionVision />

      {/* COUNTERS */}
      {totals ? (
        <section
          style={{ padding: '36px 32px', borderBottom: '1px solid var(--borde)' }}
        >
          <div
            style={{
              maxWidth: 1320,
              margin: '0 auto',
              display: 'flex',
              gap: 48,
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <CounterItem v={String(totals.activos)} l="Pilotos activos" />
            <CounterItem v="15 jul" l="2022 · fundación" />
            <CounterItem v={`${totals.anios} años`} l="De hermandad" />
            <CounterItem v="Caribe" l="Región" />
          </div>
        </section>
      ) : null}

      {/* PLANTILLA OFICIAL */}
      <section style={{ padding: '60px 32px 20px', borderBottom: '1px solid var(--borde)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 28,
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ maxWidth: 640 }}>
              <div className="kicker">· Estructura del club</div>
              <h2
                className="t-display"
                style={{
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  color: 'var(--blanco)',
                  lineHeight: 0.9,
                  margin: '6px 0 0',
                }}
              >
                La plantilla
                <br />
                <span style={{ color: 'var(--rojo)' }}>oficial</span> {new Date().getFullYear()}.
              </h2>
              <p style={{ color: 'var(--light)', fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>
                Cinco grupos. Una sola hermandad. Cada piloto tiene un rol y un dorsal.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GRUPOS_COMITE.map((g) => (
                <a
                  key={g.id}
                  href={`#${g.id}`}
                  style={{
                    fontFamily: 'var(--font-cond)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--light)',
                    border: '1px solid var(--borde)',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: 'var(--rojo)',
                      borderRadius: '50%',
                    }}
                  />
                  {g.label}
                </a>
              ))}
              <a
                href="#pilotos"
                style={{
                  fontFamily: 'var(--font-cond)',
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--light)',
                  border: '1px solid var(--borde)',
                  padding: '6px 12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ width: 6, height: 6, background: 'var(--rojo)', borderRadius: '50%' }} />
                Pilotos Oficiales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GRUPOS */}
      {error ? (
        <div style={{ padding: '24px 32px' }}>
          <ErrorBox message={error} />
        </div>
      ) : grouped === null ? (
        <div style={{ padding: '40px 32px' }}>
          <Loading />
        </div>
      ) : (
        <>
          {GRUPOS_COMITE.map((g, idx) => (
            <GroupSection
              key={g.id}
              id={g.id}
              idx={idx}
              short={g.short}
              label={g.label}
              desc={g.desc}
              members={grouped.byGrupo[g.id]}
            />
          ))}
          <GroupSection
            id="pilotos"
            idx={4}
            short="PO"
            label="Pilotos Oficiales"
            desc="Miembros activos certificados que representan al club."
            members={grouped.pilotos}
          />
        </>
      )}

      {/* CTA */}
      <section
        style={{
          padding: '64px 32px',
          borderTop: '1px solid var(--rojo)',
          background:
            'linear-gradient(135deg, rgba(204,34,34,0.05) 0%, var(--negro) 60%)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div className="kicker">· ¿Listo para rodar?</div>
          <h2
            className="t-display"
            style={{
              fontSize: 'clamp(40px, 7vw, 88px)',
              color: 'var(--blanco)',
              lineHeight: 0.95,
              margin: 0,
            }}
          >
            La próxima curva
            <br />
            te está <span style={{ color: 'var(--rojo)', fontStyle: 'italic' }}>esperando</span>.
          </h2>
          <p
            style={{
              color: 'var(--light)',
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Solicita ingreso al club y arranca como miembro General. Tu actitud te lleva al parche.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <Link
              to={ROUTES.unete}
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 13,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--blanco)',
                background: 'var(--rojo)',
                padding: '14px 22px',
                textDecoration: 'none',
                clipPath: 'var(--clip-btn)',
              }}
            >
              Solicitar ingreso →
            </Link>
            <Link
              to={ROUTES.eventos}
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 13,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--blanco)',
                background: 'transparent',
                border: '1px solid var(--borde-strong)',
                padding: '14px 22px',
                textDecoration: 'none',
              }}
            >
              Próxima rodada →
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

// ─── Misión + Visión ─────────────────────────────────────────────────────
function MisionVision() {
  return (
    <section style={{ padding: '80px 32px', borderBottom: '1px solid var(--borde)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div className="kicker">· ¿Quiénes somos?</div>
        <h2
          className="t-display"
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            color: 'var(--blanco)',
            lineHeight: 0.9,
            maxWidth: 900,
            margin: '8px 0 48px',
          }}
        >
          Más que un club. Una hermandad construida desde 2022.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
          }}
        >
          <MvCard
            num="01"
            kicker="Misión"
            title="Nuestra razón de rodar"
            body={
              <>
                Fomentar la pasión por el motociclismo y la hermandad entre nuestros miembros a
                través de la exploración de nuevos horizontes. Desde nuestra fundación el{' '}
                <strong style={{ color: 'var(--rojo)' }}>15 de julio de 2022</strong>, nos
                dedicamos a conectar personas, rodar con seguridad y compartir experiencias únicas
                que fortalezcan los lazos de nuestra comunidad en cada ruta.
              </>
            }
            decorPos="top-right"
          />
          <MvCard
            num="02"
            kicker="Visión"
            title="Hacia dónde vamos"
            body={
              <>
                Convertirnos en el club de referencia para los motociclistas de la región, siendo
                reconocidos por nuestra cultura de aventura, integridad y espíritu colaborativo.
                Aspiramos a ser una comunidad líder que inspire a otros a descubrir el mundo sobre
                dos ruedas, promoviendo siempre un impacto social positivo y la excelencia en
                nuestras rodadas.
              </>
            }
            decorPos="bottom-left"
          />
        </div>
      </div>
    </section>
  );
}

function MvCard({
  num,
  kicker,
  title,
  body,
  decorPos,
}: {
  num: string;
  kicker: string;
  title: string;
  body: React.ReactNode;
  decorPos: 'top-right' | 'bottom-left';
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--dark-1)',
        border: '1px solid var(--borde)',
        padding: 32,
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 3,
          width: 80,
          background: 'var(--rojo)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          ...(decorPos === 'top-right'
            ? { top: -40, right: -40 }
            : { bottom: -40, left: -40 }),
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(204,34,34,0.12), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="t-display"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          fontSize: 90,
          color: 'rgba(204,34,34,0.15)',
          lineHeight: 0.85,
          letterSpacing: '-0.02em',
          pointerEvents: 'none',
        }}
      >
        {num}
      </div>
      <div className="kicker" style={{ position: 'relative' }}>
        {kicker}
      </div>
      <h3
        className="t-display"
        style={{
          fontSize: 36,
          color: 'var(--blanco)',
          margin: '8px 0 16px',
          position: 'relative',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: 'var(--blanco-soft, var(--light))',
          position: 'relative',
          margin: 0,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function CounterItem({ v, l }: { v: string; l: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div
        className="t-display"
        style={{
          fontSize: 'clamp(40px, 5vw, 64px)',
          color: 'var(--blanco)',
          lineHeight: 1,
        }}
      >
        {v}
      </div>
      <div className="kicker" style={{ marginTop: 4 }}>
        {l}
      </div>
    </div>
  );
}

// ─── Group section ───────────────────────────────────────────────────────
function GroupSection({
  id,
  idx,
  short,
  label,
  desc,
  members,
}: {
  id: string;
  idx: number;
  short: string;
  label: string;
  desc: string;
  members: Member[];
}) {
  return (
    <section
      id={id}
      style={{
        padding: '60px 32px',
        borderTop: idx > 0 ? '1px solid var(--borde)' : 'none',
        scrollMarginTop: 80,
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            marginBottom: 28,
          }}
        >
          <div style={{ maxWidth: 640, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              className="t-display"
              aria-hidden="true"
              style={{
                fontSize: 80,
                color: 'rgba(204,34,34,0.25)',
                lineHeight: 0.85,
                letterSpacing: '-0.02em',
              }}
            >
              0{idx + 1}
            </div>
            <div>
              <div className="kicker">
                · {short} · {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}
              </div>
              <h3
                className="t-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  color: 'var(--blanco)',
                  lineHeight: 0.9,
                  margin: '4px 0 0',
                }}
              >
                {label}
              </h3>
            </div>
          </div>
          <p
            style={{
              color: 'var(--light)',
              fontSize: 14.5,
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 500,
            }}
          >
            {desc}
          </p>
        </header>

        {members.length === 0 ? (
          <EmptyState
            title={`Aún no hay integrantes en ${label}`}
            body="El comité asigna miembros a este grupo desde el CMS. Aparecerán aquí cuando se asignen."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            {members.map((m) => (
              <PlayerCard key={m.id} m={m} short={short} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── PlayerCard inspirada en jersey deportivo ────────────────────────────
function PlayerCard({ m, short }: { m: Member; short: string }) {
  const initials = (m.alias || `${m.nombre[0] ?? ''}${m.apellido[0] ?? ''}`)
    .slice(0, 2)
    .toUpperCase();
  const num = m.num != null ? String(m.num).padStart(2, '0') : '—';
  const desde = m.desde ?? (m.ingreso ? new Date(m.ingreso).getFullYear() : '—');

  return (
    <article
      style={{
        position: 'relative',
        background:
          'linear-gradient(180deg, var(--rojo-soft) 0%, var(--negro) 60%, var(--dark-1) 100%)',
        border: '1px solid var(--borde)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform .25s, border-color .25s, box-shadow .25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--rojo)';
        e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--borde)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cinta superior rojo con código + dorsal */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 32,
          background: 'var(--rojo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 2,
        }}
      >
        <span
          className="t-cond-up"
          style={{ fontSize: 10, color: 'var(--blanco)', letterSpacing: '0.12em' }}
        >
          {short}
        </span>
        <span
          className="t-display"
          style={{ fontSize: 18, color: 'var(--blanco)', lineHeight: 1 }}
        >
          #{num}
        </span>
      </div>

      {/* Glow radial */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 32,
          left: 0,
          right: 0,
          height: 200,
          background:
            'radial-gradient(ellipse at center top, rgba(204,34,34,0.25), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      {/* Foto / avatar grande */}
      <div
        style={{
          position: 'relative',
          height: 240,
          paddingTop: 32,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '32px 0 0 0',
            background:
              'repeating-linear-gradient(45deg, transparent 0 14px, rgba(127,127,127,0.04) 14px 15px)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="t-display"
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -16,
            right: 8,
            fontSize: 140,
            color: 'rgba(204,34,34,0.10)',
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            pointerEvents: 'none',
          }}
        >
          {initials}
        </div>

        <div
          style={{
            width: 130,
            height: 130,
            background: 'linear-gradient(135deg, var(--rojo), #4a0f0f)',
            border: '2px solid var(--rojo)',
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            boxShadow: '0 0 40px rgba(204,34,34,0.3)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {m.foto_url ? (
            <img
              src={m.foto_url}
              alt={`${m.nombre} ${m.apellido}`}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
            />
          ) : (
            <span
              className="t-display"
              style={{ fontSize: 52, color: 'var(--blanco)', letterSpacing: '0.02em' }}
            >
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Nombre + cargo + datos */}
      <div
        style={{
          padding: '14px 16px 16px',
          borderTop: '1px solid var(--borde)',
          background: 'var(--dark-1)',
        }}
      >
        <div
          className="kicker"
          style={{
            fontSize: 9,
            letterSpacing: '0.14em',
            marginBottom: 4,
          }}
        >
          {m.cargo ?? 'Piloto'}
        </div>
        <div
          className="t-display"
          style={{
            fontSize: 22,
            color: 'var(--blanco)',
            lineHeight: 1,
            letterSpacing: '0.01em',
          }}
        >
          {m.nombre}
        </div>
        <div
          className="t-display"
          style={{
            fontSize: 22,
            color: 'var(--blanco)',
            lineHeight: 1,
            letterSpacing: '0.01em',
            marginTop: 2,
          }}
        >
          {m.apellido}
        </div>

        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px solid var(--borde)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              className="kicker"
              style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.14em' }}
            >
              Placa
            </div>
            <div
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                color: 'var(--blanco)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {m.moto_placa ?? '—'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div
              className="kicker"
              style={{ fontSize: 8, color: 'var(--muted)', letterSpacing: '0.14em' }}
            >
              Desde
            </div>
            <div
              style={{
                fontFamily: 'var(--font-cond)',
                fontSize: 12,
                color: 'var(--blanco)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {desde}
            </div>
          </div>
        </div>
      </div>
    </article>
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
      Cargando plantilla…
    </div>
  );
}
