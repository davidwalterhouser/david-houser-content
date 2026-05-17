const FIELD_LABELS = {
  hook:            'opening hook (first 3 seconds of video)',
  what:            'filming plan (what to physically shoot)',
  caption_starter: 'caption starter (first line of caption)',
  viral_note:      'viral strategy note',
  platform_note:   'platform strategy',
}

export async function refineField({ post, field, currentValue, feedback }) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-api-key-here') throw new Error('NO_KEY')

  const prompt = `You are a content strategist for David Houser — 2× world record archer, founder of Beast Broadheads, competitive bowhunter and personal brand builder.

Post title: "${post.title}"
Pillar: ${post.pillar ?? 'unknown'}
Platforms: ${post.platforms?.join(', ') ?? 'unknown'}
Effort: ${post.effort ?? 'unknown'}

Current ${FIELD_LABELS[field]}:
"${currentValue}"

David's feedback: "${feedback}"

Rewrite the ${FIELD_LABELS[field]} incorporating his feedback. Keep it tailored to his brand — authentic, high-performance, hunting/archery world. Return ONLY the rewritten text with no extra labels, quotes, or explanation.`

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
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? ''
}
