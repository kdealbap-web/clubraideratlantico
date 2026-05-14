import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CLUB } from '../../lib/constants';
import { PageHeader } from '../../components/admin/PageHeader';
import { Btn } from '../../components/admin/Buttons';
import { FieldShell, TextAreaField, TextField } from '../../components/forms/Field';

interface SettingsPayload {
  hero_kicker?: string;
  hero_title?: string;
  hero_subtitle?: string;
  whatsapp_url?: string;
  sede_direccion?: string;
  sede_calendario?: string;
}

export function ConfiguracionPage() {
  const [payload, setPayload] = useState<SettingsPayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: e } = await supabase
        .from('settings')
        .select('payload')
        .eq('id', 1)
        .maybeSingle();
      if (!active) return;
      if (e) {
        setError(e.message);
      } else {
        setPayload((data?.payload as SettingsPayload) ?? {});
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    const { error: e } = await supabase
      .from('settings')
      .upsert({ id: 1, payload, updated_at: new Date().toISOString() });
    if (e) {
      setError(e.message);
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  const setField = <K extends keyof SettingsPayload>(k: K, v: SettingsPayload[K]) =>
    setPayload((p) => ({ ...p, [k]: v }));

  return (
    <section>
      <PageHeader
        kicker="Ajustes del sitio"
        title="Configuración."
        actions={
          <Btn onClick={() => void save()} disabled={saving || loading}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </Btn>
        }
      />

      {error ? (
        <div
          role="alert"
          style={{
            border: '1px solid var(--rojo)',
            background: 'var(--rojo-soft)',
            color: 'var(--rojo-light)',
            padding: '12px 14px',
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Supabase: {error}
        </div>
      ) : null}

      {saved ? (
        <div
          role="status"
          style={{
            border: '1px solid var(--success)',
            background: 'rgba(34,197,94,0.08)',
            color: 'var(--blanco)',
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          Configuración actualizada.
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'flex-start' }} className="config-grid">
        <div
          style={{
            background: 'var(--dark-1)',
            border: '1px solid var(--borde)',
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <h2 className="t-display" style={{ fontSize: 22, color: 'var(--blanco)', margin: 0 }}>
            Hero landing
          </h2>
          <FieldShell label="Kicker (corto rojo)">
            <TextField
              value={payload.hero_kicker ?? ''}
              onChange={(e) => setField('hero_kicker', e.target.value)}
              placeholder="Caribe colombiano · sin ánimo de lucro"
            />
          </FieldShell>
          <FieldShell label="Título principal">
            <TextField
              value={payload.hero_title ?? ''}
              onChange={(e) => setField('hero_title', e.target.value)}
              placeholder="Hermandad sobre dos ruedas"
            />
          </FieldShell>
          <FieldShell label="Subtítulo">
            <TextAreaField
              value={payload.hero_subtitle ?? ''}
              onChange={(e) => setField('hero_subtitle', e.target.value)}
            />
          </FieldShell>

          <h2 className="t-display" style={{ fontSize: 22, color: 'var(--blanco)', margin: '8px 0 0' }}>
            Sede
          </h2>
          <FieldShell label="Dirección">
            <TextField
              value={payload.sede_direccion ?? ''}
              onChange={(e) => setField('sede_direccion', e.target.value)}
              placeholder="Cl 84 #51-32 · Barranquilla"
            />
          </FieldShell>
          <FieldShell label="Calendario semanal">
            <TextAreaField
              value={payload.sede_calendario ?? ''}
              onChange={(e) => setField('sede_calendario', e.target.value)}
              placeholder="Lunes: reunión comité · Sábados: rodada"
            />
          </FieldShell>

          <h2 className="t-display" style={{ fontSize: 22, color: 'var(--blanco)', margin: '8px 0 0' }}>
            WhatsApp
          </h2>
          <FieldShell
            label="URL del grupo"
            hint="Si lo dejas vacío, el botón usa la URL canónica de constants.ts"
          >
            <TextField
              value={payload.whatsapp_url ?? ''}
              onChange={(e) => setField('whatsapp_url', e.target.value)}
              placeholder={CLUB.social.whatsapp.url}
            />
          </FieldShell>
        </div>

        <div
          style={{
            background: 'var(--dark-1)',
            border: '1px solid var(--borde)',
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <h2 className="t-display" style={{ fontSize: 22, color: 'var(--blanco)', margin: 0 }}>
            Constantes del club
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
            Estos valores viven en <code>src/lib/constants.ts</code>. Para cambiarlos hay que tocar
            código y desplegar — no se editan acá.
          </p>
          <Row k="Nombre" v={CLUB.nombre} />
          <Row k="Ciudad" v={CLUB.ciudad} />
          <Row k="Email info" v={CLUB.emails.info} />
          <Row k="Email admin" v={CLUB.emails.admin} />
          <Row k="Web" v={CLUB.web} />
          <Row k="Instagram" v={CLUB.social.instagram.handle} />
          <Row k="TikTok" v={CLUB.social.tiktok.handle} />
          <Row k="Facebook" v={CLUB.social.facebook.handle} />
          <Row k="WhatsApp default" v={CLUB.social.whatsapp.url} />
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--borde)',
        paddingBottom: 6,
        fontSize: 13,
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          color: 'var(--light)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontSize: 11,
        }}
      >
        {k}
      </span>
      <span style={{ color: 'var(--blanco)', textAlign: 'right' }}>{v}</span>
    </div>
  );
}
