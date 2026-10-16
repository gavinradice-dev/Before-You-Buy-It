// Before You Buy — runs the AI and photo search, and serves the website files.
const json = (o, s = 200, extra = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', ...extra } });

async function ai(request, env) {
  let body; try { body = await request.json(); } catch { return json({ error: 'bad request' }, 400); }
  const prompt = String(body.prompt || '').slice(0, 12000) + '\n\nReply with only the JSON object, no other text.';
  const img = (body.images || [])[0];
  try {
    if (env.GEMINI_API_KEY) {
      const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
      const parts = [{ text: prompt }]; if (img) parts.unshift({ inline_data: { mime_type: img.media_type, data: img.data } });
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json' } }) });
      if (!r.ok) return json({ error: 'gemini ' + r.status, detail: (await r.text()).slice(0, 300) }, 502);
      const d = await r.json(); return json({ text: (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('') });
    }
    if (env.ANTHROPIC_API_KEY) {
      const content = []; if (img) content.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } }); content.push({ type: 'text', text: prompt });
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: env.CLAUDE_MODEL || 'claude-sonnet-5-5', max_tokens: 2000, messages: [{ role: 'user', content }] }) });
      if (!r.ok) return json({ error: 'claude ' + r.status }, 502);
      const d = await r.json(); return json({ text: (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('') });
    }
    return json({ error: 'No AI key set. Add GEMINI_API_KEY in Settings > Variables and Secrets.' }, 503);
  } catch (e) { return json({ error: 'failed' }, 502); }
}

async function photo(request) {
  const q = new URL(request.url).searchParams.get('q') || '';
  if (!q) return json({});
  try {
    const r = await fetch(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial&page_size=5&mature=false`, { headers: { 'User-Agent': 'BeforeYouBuy/1.0' } });
    if (!r.ok) return json({});
    const d = await r.json();
    const x = (d.results || []).find(i => i.url && (i.width || 0) >= 400) || (d.results || [])[0];
    return x ? json({ url: x.url, creator: x.creator, license: (x.license || '').toUpperCase() + ' ' + (x.license_version || ''), page: x.foreign_landing_url }, 200, { 'cache-control': 'public, max-age=604800' }) : json({});
  } catch { return json({}); }
}

export default {
  async fetch(request, env) {
    const p = new URL(request.url).pathname;
    if (p === '/api/claude' && request.method === 'POST') return ai(request, env);
    if (p === '/api/photo') return photo(request);
    if (p === '/api/health') return json({ ok: true, ai: env.GEMINI_API_KEY ? 'gemini' : env.ANTHROPIC_API_KEY ? 'claude' : 'none' });
    return env.ASSETS.fetch(request);
  }
};
