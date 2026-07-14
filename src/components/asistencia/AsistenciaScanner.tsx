import { useEffect, useRef, useState } from 'react';
import type { Html5Qrcode as QrScanner } from 'html5-qrcode';
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
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [count, setCount] = useState(0);
  const scannerRef = useRef<QrScanner | null>(null);
  const lastRef = useRef<{ code: string; t: number }>({ code: '', t: 0 });
  const busyRef = useRef(false);

  const stop = async () => {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        await s.stop();
        s.clear();
      } catch {
        /* la cámara ya estaba detenida */
      }
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  const handleDecoded = async (text: string) => {
    const now = Date.now();
    if (busyRef.current) return;
    // Ignora el mismo QR repetido (html5-qrcode dispara en cada frame).
    if (lastRef.current.code === text && now - lastRef.current.t < 3500) return;
    lastRef.current = { code: text, t: now };
    busyRef.current = true;
    try {
      const cedula = extractCedula(text);
      if (!cedula) {
        setFeedback({ kind: 'error', msg: 'QR no válido' });
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
      setTimeout(() => {
        busyRef.current = false;
      }, 1500);
    }
  };

  const start = async () => {
    setFeedback(null);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          void handleDecoded(decoded);
        },
        () => {
          /* error de decodificación por frame: se ignora */
        },
      );
      setScanning(true);
    } catch (e) {
      setFeedback({
        kind: 'error',
        msg: e instanceof Error ? e.message : 'No se pudo abrir la cámara. Da permiso de cámara.',
      });
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      <div
        id={SCANNER_ID}
        style={{
          width: '100%',
          maxWidth: 380,
          minHeight: scanning ? 280 : 0,
          background: 'var(--negro)',
          border: scanning ? '1px solid var(--rojo)' : '1px dashed var(--borde)',
          overflow: 'hidden',
        }}
      />

      {feedback ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            width: '100%',
            maxWidth: 380,
            border: `1px solid ${fbColor}`,
            background: fbBg,
            color: fbColor,
            padding: '12px 14px',
            fontFamily: 'var(--font-cond)',
            fontSize: 14,
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          {feedback.msg}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {scanning ? (
          <Btn variant="ghost" type="button" onClick={() => void stop()}>
            Detener cámara
          </Btn>
        ) : (
          <Btn type="button" onClick={() => void start()}>
            Abrir cámara
          </Btn>
        )}
        <span style={{ color: 'var(--muted)', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
          Registrados: <strong style={{ color: 'var(--success)' }}>{count}</strong>
        </span>
      </div>
    </div>
  );
}
