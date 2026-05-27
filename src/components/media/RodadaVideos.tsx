import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { VideoPlayer } from './VideoPlayer';
import type { GalleryItem } from '../../types';

/**
 * Videos vinculados a una rodada/evento. Se muestra dentro del detalle
 * del evento (público y cronograma). Si no hay videos, no renderiza nada.
 */
export function RodadaVideos({ eventId }: { eventId: string }) {
  const [vids, setVids] = useState<GalleryItem[] | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('gallery')
        .select('*')
        .eq('event_id', eventId)
        .eq('type', 'video')
        .order('created_at', { ascending: false });
      if (!active) return;
      setVids((data ?? []) as GalleryItem[]);
    })();
    return () => {
      active = false;
    };
  }, [eventId]);

  if (!vids || vids.length === 0) return null;

  return (
    <section style={{ marginBottom: 22 }}>
      <h3 className="kicker" style={{ fontSize: 11, margin: '0 0 10px' }}>
        · Videos de la rodada
      </h3>
      <div style={{ display: 'grid', gap: 14 }}>
        {vids.map((v) => (
          <figure key={v.id} style={{ margin: 0 }}>
            <VideoPlayer url={v.url} poster={v.poster_url} label={v.label} />
            {v.label ? (
              <figcaption
                style={{
                  color: 'var(--muted)',
                  fontSize: 12,
                  marginTop: 6,
                  fontFamily: 'var(--font-cond)',
                  letterSpacing: '0.06em',
                }}
              >
                {v.label}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
