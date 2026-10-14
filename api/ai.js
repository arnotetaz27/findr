// Pont vers l'IA : vérifie la connexion, limite l'usage, puis appelle l'API d'Anthropic.
// La clé ANTHROPIC_API_KEY ne quitte jamais le serveur.
const MAX_PROMPT = 60000;
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '200', 10);

async function getUser(token) {
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
  });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? u : null;
}

async function underLimit(uid) {
  const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/bump_usage`, {
    method: 'POST',
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uid, lim: DAILY_LIMIT })
  });
  if (!r.ok) return true; // en cas d'erreur de comptage, on ne bloque pas le candidat
  return (await r.json()) === true;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!process.env.ANTHROPIC_API_KEY || !process.env.SUPABASE_URL) return res.status(500).json({ error: 'not_configured' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  const user = await getUser(token).catch(() => null);
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const prompt = body && typeof body.prompt === 'string' ? body.prompt : '';
  if (!prompt || prompt.length > MAX_PROMPT) return res.status(400).json({ error: 'bad_prompt' });

  if (process.env.SUPABASE_SERVICE_KEY && !(await underLimit(user.id))) return res.status(429).json({ error: 'rate_limited' });

  const model = body.fast
    ? (process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-5-5')
    : (process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5');

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ model, max_tokens: 4096, messages: [{ role: 'user', content: prompt }] })
  }).catch(() => null);
  if (!r) return res.status(502).json({ error: 'upstream_unreachable' });
  if (r.status === 429) return res.status(429).json({ error: 'rate_limited' });
  if (!r.ok) {
    console.error('anthropic', r.status, (await r.text()).slice(0, 300));
    return res.status(502).json({ error: 'upstream_error' });
  }
  const j = await r.json();
  const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
  res.status(200).json({ text });
};
