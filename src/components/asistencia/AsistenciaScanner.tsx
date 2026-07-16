import { useEffect, useRef, useState } from 'react';
import type { Html5QrcodeScanner as ScannerType } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { Btn } from '../admin/Buttons';
import type { EventItem } from '../../types';

const SCANNER_ID = 'asistencia-scanner';

type Feedback = { kind: 'ok' | 'dup' | 'error'; msg: string } | null;

interface Props {
  event: EventItem;
  registradoPor: string | null;
  onRegistered?: () => void;
}

/** Extrae la cédula (dígitos) de un QR: "raider:id:cedula", "1,002,127,934" o dígitos planos. */
function extractCedula(text: string): string | null {
  const parts = text.split(':');
  const raw = parts.length > 1 ? parts[parts.length - 1] : text;
  const digits = (raw ?? '').replace(/\D/g, '');
  return digits.length >= 5 ? digits : null;
}

export function AsistenciaScanner({ event, registradoPor, onRegistered }: Props) {
  const [active, setActive] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [count, setCount] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const scannerRef = useRef<ScannerType | null>(null);
  const lastRef = useRef<{ code: string; t: number }>({ code: '', t: 0 });
  const busyRef = useRef(false);

  const handleDecoded = async (text: string) => {
    const now = Date.now();
    if (busyRef.current) return;
    // ignora el mismo QR repetido (el escáner dispara varias veces por segundo)
    if (lastRef.current.code === text && now - lastRef.current.t < 3500) return;
    lastRef.current = { code: text, t: now };
    busyRef.current = true;
    setLastScan(text);
    try {
      const cedula = extractCedula(text);
      if (!cedula) {
        setFeedback({ kind: 'error', msg: `QR leído pero no parece una cédula: "${text}"` });
        return;
      }
      const { data: m } = await supabase
        .from('members')
        .select('id, nombre, apellido')
        .eq('cedula', cedula)
        .maybeSingle();
      if (!m) {
        setFeedback({ kind: 'error', msg: `Cédula ${cedula} no está registrada como miembro` });
        return;
      }
      const member = m as { id: string; nombre: string; apellido: string };
      const hora = new Date().toTimeString().slice(0, 8);
      const { error } = await supabase.from('asistencias').insert({
        member_id: member.id,
        event_id: event.id,
        fecha: event.fecha,
        hora,
        codigo: cedula,
        origen: 'qr',
        registrado_por: registradoPor,
      });
      if (error) {
        if (error.code === '23505') {
          setFeedback({ kind: 'dup', msg: `${member.nombre} ${member.apellido} ya estaba registrado hoy` });
        } else {
          setFeedback({ kind: 'error', msg: error.message });
        }
        return;
      }
      setFeedback({ kind: 'ok', msg: `✓ Asistencia registrada: ${member.nombre} ${member.apellido}` });
      setCount((c) => c + 1);
      onRegistered?.();
    } finally {
      // pequeño respiro para no doble-registrar
      setTimeout(() => {
        busyRef.current = false;
      }, 1500);
    }
  };

  // Mantiene el handler más reciente sin re-crear el escáner.
  const handlerRef = useRef(handleDecoded);
  handlerRef.current = handleDecoded;

  // Monta/desmonta el escáner cuando `active` cambia.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let scanner: ScannerType | null = null;

    (async () => {
      try {
        const mod = await import('html5-qrcode');
        if (cancelled) return;
        scanner = new mod.Html5QrcodeScanner(
          SCANNER_ID,
          {
            fps: 10,
            // qrbox adaptable al tamaño real del video (evita el "qrbox > video" en móviles)
            qrbox: (w: number, h: number) => {
              const size = Math.floor(Math.min(w, h) * 0.7);
              return { width: size, height: size };
            },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            supportedScanTypes: [mod.Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          },
          false,
        );
        scannerRef.current = scanner;
        scanner.render(
          (decoded: string) => {
            void handlerRef.current(decoded);
          },
          () => {
            /* error por frame (QR no encontrado): se ignora */
          },
        );
      } catch (e) {
        setFeedback({
          kind: 'error',
          msg: e instanceof Error ? e.message : 'No se pudo iniciar el escáner.',
        });
        setActive(false);
      }
    })();

    return () => {
      cancelled = true;
      const s = scanner ?? scannerRef.current;
      scannerRef.current = null;
      if (s) void s.clear().catch(() => undefined);
    };
  }, [active]);

  const start = () => {
    setFeedback(null);
    setLastScan(null);
    if (!window.isSecureContext) {
      setFeedback({
        kind: 'error',
        msg: 'La cámara solo funciona en HTTPS. Abre el sitio con https:// (o localhost).',
      });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setFeedback({ kind: 'error', msg: 'Este navegador no soporta cámara. Prueba con Chrome actualizado.' });
      return;
    }
    setActive(true);
  };

  const fbColor =
    feedback?.kind === 'ok'
      ? 'var(--success)'
      : feedback?.kind === 'dup'
        ? 'var(--warn)'
        : 'var(--rojo-light)';
  const fbBg =
    feedback?.kind === 'ok'
      ? 'rgba(34,197,94,0.12)'
      : feedback?.kind === 'dup'
        ? 'rgba(245,158,11,0.12)'
        : 'var(--rojo-soft)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      {!active ? (
        <>
          <p style={{ color: 'var(--light)', fontSize: 13.5, textAlign: 'center', maxWidth: 380, lineHeight: 1.5 }}>
            Toca <strong>Iniciar escáner</strong> y permite el acceso a la cámara. Apunta al QR del
            carnet del piloto (pantalla del portal).
          </p>
          <Btn type="button" onClick={start}>
            Iniciar escáner
          </Btn>
        </>
      ) : (
        <>
          <div id={SCANNER_ID} style={{ width: '100%', maxWidth: 360 }} />
          <Btn variant="ghost" type="button" onClick={() => setActive(false)}>
            Detener cámara
          </Btn>
        </>
      )}

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: '100%',
            maxWidth: 360,
            border: `1px solid ${fbColor}`,
            background: fbBg,
            color: fbColor,
            padding: '12px 14px',
            fontFamily: 'var(--font-cond)',
            fontSize: 14,
            letterSpacing: '0.03em',
            textAlign: 'center',
          }}
        >
          {feedback.msg}
        </div>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        <span style={{ color: 'var(--muted)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
          Registrados en esta sesión: <strong style={{ color: 'var(--success)' }}>{count}</strong>
        </span>
        {lastScan ? (
          <span style={{ color: 'var(--muted)', fontSize: 11 }}>
            Último QR leído: <code style={{ color: 'var(--light)' }}>{lastScan}</code>
          </span>
        ) : null}
      </div>

      {/* Estiliza el widget de html5-qrcode para el tema oscuro */}
      <style>{`
        #${SCANNER_ID} { color: var(--blanco); font-family: var(--font-body); }
        #${SCANNER_ID} video { border-radius: 4px; }
        #${SCANNER_ID} button {
          font-family: var(--font-cond); letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--rojo); color: #fff; border: none; padding: 10px 16px;
          cursor: pointer; font-size: 13px; margin: 4px 0;
        }
        #${SCANNER_ID} select {
          background: var(--dark-2); color: var(--blanco); border: 1px solid var(--borde);
          padding: 8px; font-size: 13px; border-radius: 3px;
        }
        #${SCANNER_ID} a { color: var(--rojo); }
        #${SCANNER_ID} span, #${SCANNER_ID} div { color: var(--light); }
        #${SCANNER_ID}__dashboard_section_csr span { color: var(--light); }
      `}</style>
    </div>
  );
}
