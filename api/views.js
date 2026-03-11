export default async function handler(req, res) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { UPSTASH_URL, UPSTASH_TOKEN } = process.env;

  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ error: 'Missing Upstash configuration' });
  }

  try {
    const upstream = await fetch(`${UPSTASH_URL}/incr/portfolio_views`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: 'Upstash request failed' });
    }

    const data = await upstream.json();
    const count = Number(data.result);

    if (!Number.isFinite(count)) {
      return res.status(502).json({ error: 'Invalid Upstash response' });
    }

    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to load views' });
  }
}
