// Finds a freely licensed photo for anything new that's searched (Openverse, free, no key needed).
export async function onRequestGet({ request }) {
  const req = request;
  const q = new URL(req.url).searchParams.get('q') || '';
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=604800' } });
  if (!q) return json({});
  try {
    const r = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial&page_size=5&mature=false`, { headers: { 'User-Agent': 'BeforeYouBuy/1.0' } });
    if (!r.ok) return json({});
    const d = await r.json();
    const x = (d.results || []).find(i => i.url && (i.width || 0) >= 400) || (d.results || [])[0];
    return x ? json({ url: x.url, creator: x.creator, license: (x.license || '').toUpperCase() + ' ' + (x.license_version || ''), page: x.foreign_landing_url }) : json({});
  } catch { return json({}); }
}
