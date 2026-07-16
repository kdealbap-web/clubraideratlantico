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

function cameraError(e: unknown): string {
  const name = (e as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Permiso de cámara denegado. Toca el candado de la barra de direcciones → Permisos → Cámara → Permitir, y recarga.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError')
    return 'No se encontró una cámara utilizable en el dispositivo.';
  if (name === 'NotReadableError')
    return 'La cámara está ocupada por otra app. Ciérrala e intenta de nuevo.';
  return `No se pudo acceder a la cámara${name ? ` (${name})` : ''}. Usa el registro por cédula abajo.`;
}

export function AsistenciaScanner({ event, registradoPor, onRegistered }: Props) {
  const [active, setActive] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [count, setCount] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lastRef = useRef<{ code: string; t: number }>({ code: '', t: 0 });
  const busyRef = useRef(false);
  const scannerRef = useRef<ScannerType | null>(null);

  /** Núcleo compartido: registra la asistencia de una cédula (QR o manual). */
  const registrar = async (cedula: string) => {
    const { data: m, error: qErr } = await supabase
      .from('members')
      .select('id, nombre, apellido')
      .eq('cedula', cedula)
      .maybeSingle();
    if (qErr) {
      setFeedback({ kind: 'error', msg: qErr.message });
      return;
    }
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
  };

  const handleDecoded = async (text: string) => {
    const now = Date.now();
    if (busyRef.current) return;
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
      await registrar(cedula);
    } finally {
      setTimeout(() => {
        busyRef.current = false;
      }, 1500);
    }
  };

  const handlerRef = useRef(handleDecoded);
  handlerRef.current = handleDecoded;

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
          () => {},
        );
      } catch (e) {
        setFeedback({ kind: 'error', msg: e instanceof Error ? e.message : 'No se pudo iniciar el escáner.' });
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

  // Pide permiso dentro del gesto del click y reporta el error exacto.
  const start = async () => {
    setFeedback(null);
    setLastScan(null);
    if (!window.isSecureContext) {
      setFeedback({
        kind: 'error',
        msg: 'La cámara solo funciona con HTTPS (candado). Abre el sitio con https:// y reintenta.',
      });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setFeedback({ kind: 'error', msg: 'Este navegador no soporta cámara. Usa el registro por cédula.' });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      stream.getTracks().forEach((t) => t.stop());
    } catch (e) {
      setFeedback({ kind: 'error', msg: cameraError(e) });
      return;
    }
    setActive(true);
  };

  const submitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedula = manual.replace(/\D/g, '');
    if (cedula.length < 5) {
      setFeedback({ kind: 'error', msg: 'Escribe una cédula válida (solo números).' });
      return;
    }
    setSubmitting(true);
    try {
      await registrar(cedula);
      setManual('');
    } finally {
      setSubmitting(false);
    }
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      {/* --- Cámara --- */}
      {!active ? (
        <>
          <p style={{ color: 'var(--light)', fontSize: 13.5, textAlign: 'center', maxWidth: 380, lineHeight: 1.5 }}>
            Toca <strong>Iniciar escáner</strong> y permite la cámara. Apunta al QR del carnet del
            piloto.
          </p>
          <Btn type="button" onClick={() => void start()}>
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

      {/* --- Feedback --- */}
      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: '100%',
            maxWidth: 400,
            border: `1px solid ${fbColor}`,
            background: fbBg,
            color: fbColor,
            padding: '12px 14px',
            fontFamily: 'var(--font-cond)',
            fontSize: 14,
            letterSpacing: '0.03em',
            textAlign: 'center',
            lineHeight: 1.4,
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

      {/* --- Registro manual (siempre disponible, no depende de la cámara) --- */}
      <form
        onSubmit={(e) => void submitManual(e)}
        style={{
          width: '100%',
          maxWidth: 400,
          borderTop: '1px dashed var(--borde)',
          paddingTop: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <label
          style={{
            fontFamily: 'var(--font-cond)',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--light)',
          }}
        >
          Registro manual por cédula
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            inputMode="numeric"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Cédula del piloto"
            style={{
              flex: 1,
              height: 40,
              background: 'var(--dark-2)',
              color: 'var(--blanco)',
              border: '1px solid var(--borde)',
              padding: '0 12px',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <Btn type="submit" disabled={submitting}>
            {submitting ? '…' : 'Registrar'}
          </Btn>
        </div>
      </form>

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
      `}</style>
    </div>
  );
}
