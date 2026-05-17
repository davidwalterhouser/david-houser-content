const SYSTEM = `You are a content strategist for David Houser — 2× world record archer, founder of Beast Broadheads, competitive bowhunter, husband and father. His brand is built on authenticity, elite skill, and the hunting lifestyle.

Content pillars: Personal Brand, Education, Fitness & Grind, Family, Behind the Business, Engagement, Social Proof, Conservation / Values, Seasonal, Product Demo, Bowmar, Hunting, Collab.

Your job: take a raw idea and develop it into a complete, high-performing content piece. Think about what stops the scroll, drives watch-time, and earns saves and shares in the hunting/archery/personal brand space.

Return ONLY valid JSON — no markdown, no explanation, just the object.`

const USER_PROMPT = (idea) => `Raw idea: "${idea}"

Develop this into a full content post. Return exactly this JSON shape:
{
  "title": "Short punchy working title (max 80 chars)",
  "pillar": "one pillar from the list above",
  "platform": "instagram" or "tiktok" or "youtube" or "facebook" or "multi",
  "platforms": ["IG Reel", "TikTok"],
  "effort": "Low" or "Medium" or "High",
  "type": "reel" or "short" or "video" or "post" or "story",
  "hook": "The first 3 seconds — spoken line or visual hook that stops the scroll. Be specific and punchy.",
  "what": "What to actually film — specific scenes, b-roll, angles, talking points. Practical direction.",
  "caption_starter": "First line of the caption that earns the click to read more.",
  "viral_note": "Why this format has viral potential — audience psychology, algorithm behaviour, or format insight.",
  "platform_note": "Where this hits hardest and why. Platform-specific strategy."
}

platforms array must only use these exact strings: IG Reel, IG Feed, IG Carousel, IG Stories, TikTok, YT Shorts, YT, FB, FB Video`

export async function polishIdea(ideaText) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-api-key-here') {
    throw new Error('NO_KEY')
  }

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
      max_tokens: 1200,
      system: SYSTEM,
      messages: [{ role: 'user', content: USER_PROMPT(ideaText) }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text ?? ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Could not parse response')
  return JSON.parse(match[0])
}
