import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadToBucket } from '../../lib/storage';
import { resizeImage, parseCedulaFromFilename } from '../../lib/image';
import { CUMPLE_ROLES } from '../cronograma/cumpleanos';
import { Btn } from './Buttons';
import { IconUpload } from '../icons';
import type { Member } from '../../types';

type Estado = 'pendiente' | 'subiendo' | 'ok' | 'error' | 'sin-match';

interface Fila {
  file: File;
  previewUrl: string;
  cedula: string | null;
  member: Member | null;
  estado: Estado;
  mensaje?: string;
}

interface Props {
  members: Member[];
  onClose: () => void;
  onUploaded: () => void;
}

/** ¿Este miembro (ya con foto) aparecerá en la sección de cumpleaños? Si no, por qué. */
function motivoCumple(m: Member): string | null {
  if (!CUMPLE_ROLES.includes(m.rol)) return `su rol (${m.rol}) no se lista en cumpleaños`;
  if (m.estado !== 'activo') return `estado "${m.estado}" — debe ser "activo"`;
  if (!m.fecha_nac) return 'no tiene fecha de nacimiento cargada';
  return null;
}

export function BulkFotosPilotos({ members, onClose, onUploaded }: Props) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const filasRef = useRef<Fila[]>([]);
  filasRef.current = filas;

  // Índice cédula (solo dígitos) → miembro.
  const porCedula = useMemo(() => {
    const map = new Map<string, Member>();
    for (const m of members) {
      const c = (m.cedula ?? '').replace(/\D/g, '');
      if (c) map.set(c, m);
    }
    return map;
  }, [members]);

  // libera los object URLs de los previews al desmontar (usa ref para no cerrar sobre un valor viejo)
  useEffect(
    () => () => {
      filasRef.current.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    },
    [],
  );

  const onFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    filas.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    const nuevas: Fila[] = Array.from(fileList).map((file) => {
      const cedula = parseCedulaFromFilename(file.name);
      const member = cedula ? (porCedula.get(cedula) ?? null) : null;
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        cedula,
        member,
        estado: member ? 'pendiente' : 'sin-match',
      };
    });
    setFilas(nuevas);
    setDone(false);
  };

  const emparejadas = filas.filter((f) => f.member);
  const sinMatch = filas.filter((f) => !f.member);

  const procesar = async () => {
    setRunning(true);
    const snapshot = filas;
    for (let i = 0; i < snapshot.length; i++) {
      const f = snapshot[i];
      if (!f || !f.member) continue;
      setFilas((prev) => prev.map((x, idx) => (idx === i ? { ...x, estado: 'subiendo' } : x)));
      try {
        const blob = await resizeImage(f.file, { maxDim: 1000, quality: 0.82, mime: 'image/webp' });
        const up = await uploadToBucket(blob, {
          prefix: 'members/',
          filename: `${f.cedula ?? 'foto'}.webp`,
        });
        const { error } = await supabase
          .from('members')
          .update({ foto_url: up.url, foto_path: up.path })
          .eq('id', f.member.id);
        if (error) throw error;
        setFilas((prev) => prev.map((x, idx) => (idx === i ? { ...x, estado: 'ok' } : x)));
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : 'Error al subir';
        setFilas((prev) =>
          prev.map((x, idx) => (idx === i ? { ...x, estado: 'error', mensaje } : x)),
        );
      }
    }
    setRunning(false);
    setDone(true);
    onUploaded();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--light)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
        Selecciona las fotos nombradas por <strong>cédula</strong> (ej. <code>1002028831.jpg</code>).
        Cada foto se empareja automáticamente con el miembro que tenga esa cédula, se optimiza a
        WebP en tu navegador y se sube a su perfil.
      </p>

      <label
        htmlFor="bulk-fotos"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '28px 18px',
          border: '1px dashed var(--borde-strong)',
          background: 'var(--dark-2)',
          cursor: running ? 'wait' : 'pointer',
          color: 'var(--light)',
        }}
      >
        <IconUpload size={26} />
        <div
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 12,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--blanco)',
            fontWeight: 600,
          }}
        >
          Haz click para elegir fotos
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          Varias a la vez · JPG/PNG · nombradas por cédula
        </div>
        <input
          id="bulk-fotos"
          type="file"
          accept="image/*"
          multiple
          disabled={running}
          onChange={(e) => onFiles(e.target.files)}
          style={{ display: 'none' }}
        />
      </label>

      {filas.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12.5 }}>
            <Resumen label="Fotos" valor={filas.length} color="var(--light)" />
            <Resumen label="Emparejadas" valor={emparejadas.length} color="var(--success)" />
            <Resumen label="Sin miembro" valor={sinMatch.length} color="var(--warn)" />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 360,
              overflowY: 'auto',
              border: '1px solid var(--borde)',
              padding: 8,
            }}
          >
            {filas.map((f, i) => {
              const aviso = f.member ? motivoCumple(f.member) : null;
              return (
                <div
                  key={`${f.file.name}-${i}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    padding: '6px 8px',
                    background: 'var(--dark-1)',
                    border: '1px solid var(--borde)',
                  }}
                >
                  <img
                    src={f.previewUrl}
                    alt=""
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      objectPosition: 'center 25%',
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--blanco)', fontSize: 13 }}>
                      {f.member ? (
                        `${f.member.nombre} ${f.member.apellido}`
                      ) : (
                        <span style={{ color: 'var(--warn)' }}>
                          {f.cedula
                            ? `Cédula ${f.cedula} sin miembro`
                            : 'No se detectó cédula en el nombre'}
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'var(--muted)', fontSize: 11 }}>
                      {f.file.name}
                      {aviso ? (
                        <span style={{ color: 'var(--warn)' }}> · no saldrá en cumpleaños: {aviso}</span>
                      ) : null}
                    </div>
                  </div>
                  <EstadoBadge fila={f} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Btn variant="ghost" type="button" onClick={onClose} disabled={running}>
              {done ? 'Cerrar' : 'Cancelar'}
            </Btn>
            <Btn
              type="button"
              onClick={() => void procesar()}
              disabled={running || emparejadas.length === 0}
            >
              {running
                ? 'Subiendo…'
                : `Subir ${emparejadas.length} foto${emparejadas.length === 1 ? '' : 's'}`}
            </Btn>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Resumen({ label, valor, color }: { label: string; valor: number; color: string }) {
  return (
    <span style={{ color: 'var(--muted)' }}>
      {label}:{' '}
      <strong style={{ color, fontVariantNumeric: 'tabular-nums' }}>{valor}</strong>
    </span>
  );
}

function EstadoBadge({ fila }: { fila: Fila }) {
  const map: Record<Estado, { txt: string; color: string }> = {
    pendiente: { txt: 'Listo', color: 'var(--light)' },
    subiendo: { txt: 'Subiendo…', color: 'var(--warn)' },
    ok: { txt: '✓ Subida', color: 'var(--success)' },
    error: { txt: 'Error', color: 'var(--rojo-light)' },
    'sin-match': { txt: 'Sin match', color: 'var(--warn)' },
  };
  const { txt, color } = map[fila.estado];
  return (
    <span
      title={fila.mensaje}
      style={{
        fontFamily: 'var(--font-cond)',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '3px 8px',
        border: `1px solid ${color}`,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {txt}
    </span>
  );
}
