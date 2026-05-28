// ============================================================
// Open Graph preview server-side para bots de redes sociales.
//
// Cuando un bot (WhatsApp, FB, Twitter, etc.) pide /noticias/:id o
// /eventos/:id, vercel.json reescribe a esta función. Aquí leemos el
// recurso desde Supabase (REST + RLS pública, no requiere auth) y
// devolvemos HTML con OG meta tags. Los humanos siguen viendo el SPA
// porque la regla `has.user-agent` solo activa el rewrite para bots.
// ============================================================

export const config = { runtime: 'edge' };

interface OgData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'article' | 'website';
}

function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ogHtml({ title, description, image, url, type = 'article' }: OgData): string {
  const t = esc(title);
  const d = esc(description);
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${t} · Club Raider Atlántico</title>
<meta name="description" content="${d}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Club Raider Atlántico">
<meta property="og:locale" content="es_CO">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${image}">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${url}">
</head>
<body style="background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;text-align:center;padding:40px;">
<p>Redirigiendo a <a href="${url}" style="color:#cc2222;">${t}</a>…</p>
</body>
</html>`;
}

async function fetchRow(
  table: string,
  id: string,
  columns: string,
  extra = '',
): Promise<Record<string, unknown> | null> {
  const supabaseUrl =
    process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const anon =
    process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';
  if (!supabaseUrl || !anon) return null;
  const u = `${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(columns)}&id=eq.${encodeURIComponent(id)}${extra}&limit=1`;
  const res = await fetch(u, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  if (!res.ok) return null;
  const arr = (await res.json()) as unknown[];
  return (arr[0] as Record<string, unknown> | undefined) ?? null;
}

const RESP_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'cache-control': 'public, max-age=300, s-maxage=600',
};

export default async function handler(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const type = u.searchParams.get('type');
  const id = u.searchParams.get('id');
  const origin = `${u.protocol}//${u.host}`;
  const ogDefault = `${origin}/logo.png`;

  if (type === 'noticia' && id) {
    const n = await fetchRow('news', id, 'id,titulo,resumen,cover_url', '&estado=eq.publicado');
    if (n) {
      const cover = String(n['cover_url'] ?? '').trim();
      return new Response(
        ogHtml({
          title: String(n['titulo'] ?? 'Comunicado'),
          description:
            String(n['resumen'] ?? '').trim() ||
            'Comunicado oficial del Club Raider Atlántico.',
          image: cover || ogDefault,
          url: `${origin}/noticias/${id}`,
        }),
        { headers: RESP_HEADERS },
      );
    }
  }

  if (type === 'evento' && id) {
    const e = await fetchRow(
      'events',
      id,
      'id,titulo,descripcion,fecha,hora,salida,cover_url',
    );
    if (e) {
      const meta = [String(e['fecha'] ?? ''), String(e['hora'] ?? ''), String(e['salida'] ?? '')]
        .filter(Boolean)
        .join(' · ');
      const cover = String(e['cover_url'] ?? '').trim();
      const longDesc = `${meta}. ${String(e['descripcion'] ?? '')}`.trim();
      return new Response(
        ogHtml({
          title: String(e['titulo'] ?? 'Rodada'),
          description: longDesc.slice(0, 280) || 'Rodada del Club Raider Atlántico.',
          image: cover || ogDefault,
          url: `${origin}/eventos/${id}`,
        }),
        { headers: RESP_HEADERS },
      );
    }
  }

  return new Response(
    ogHtml({
      title: 'Club Raider Atlántico',
      description:
        'Comunidad de motociclistas del Caribe colombiano. Rodadas, hermandad y red de apoyo vial.',
      image: ogDefault,
      url: origin,
      type: 'website',
    }),
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}
