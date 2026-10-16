// AI for the site. Uses Google Gemini's FREE tier if GEMINI_API_KEY is set, otherwise Claude if ANTHROPIC_API_KEY is set.
// Set keys in Netlify > Project configuration > Environment variables.
export async function onRequestPost({ request, env }) {
  const req = request; const process = { env };
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json' } });
  let body; try { body = await req.json(); } catch { return json({ error: 'bad request' }, 400); }
  const prompt = String(body.prompt || '').slice(0, 12000) + '\n\nReply with only the JSON object, no other text.';
  const img = (body.images || [])[0];
  try {
    if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const parts = [{ text: prompt }]; if (img) parts.unshift({ inline_data: { mime_type: img.media_type, data: img.data } });
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json' } }) });
      if (!r.ok) return json({ error: r.status }, 502);
      const d = await r.json(); return json({ text: (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('') });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      const content = []; if (img) content.push({ type: 'image', source: { type: 'base64', media_type: img.media_type, data: img.data } }); content.push({ type: 'text', text: prompt });
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-5-5', max_tokens: 2000, messages: [{ role: 'user', content }] }) });
      if (!r.ok) return json({ error: r.status }, 502);
      const d = await r.json(); return json({ text: (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('') });
    }
    return json({ error: 'AI is not turned on yet' }, 503);
  } catch (e) { return json({ error: 'failed' }, 502); }
}
