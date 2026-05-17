export async function generateViralIdeas() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-api-key-here') throw new Error('NO_KEY')

  const prompt = `You are a viral content strategist for David Houser — 2× world record archer, founder of Beast Broadheads, competitive bowhunter and personal brand builder. His audience is hunters, bow hunters, and high-performance athletes.

Generate 10 viral content ideas across Instagram Reels, TikTok, and YouTube that would perform well RIGHT NOW based on current platform trends (short-form storytelling, authenticity, how-to, controversy, behind-the-scenes). Tailor every idea to David's specific niche and brand.

Return a JSON array of exactly 10 objects with this structure:
{
  "id": number (1-10),
  "format": "short punchy format name",
  "virality": "Insane" | "Very High" | "High",
  "platforms": ["IG", "TikTok", "YT"] (1-3 platforms that fit best),
  "hook": "the exact opening line David would say on camera",
  "why": "2-3 sentences on why this format is crushing it right now and why it fits David specifically",
  "pillars": ["pillar1", "pillar2"] (from: Personal Brand, Education, Fitness & Grind, Family, Behind the Business, Hunting, Product Demo, Social Proof)
}

Return ONLY the JSON array, no other text.`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  const text = data.content?.[0]?.text?.trim() ?? '[]'
  const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(json)
}
