export async function generateScript({ post, roughNotes }) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-api-key-here') throw new Error('NO_KEY')

  const prompt = `You are writing a teleprompter script for David Houser — 2× world record archer, founder of Beast Broadheads, competitive bowhunter and personal brand builder. His tone is authentic, confident, high-performance, and speaks directly to hunters and bow hunters. Not corporate. Not salesy. Real.

Post details:
- Title: "${post.title}"
- Type: ${post.type ?? 'video'}
- Platform: ${post.platform ?? 'unknown'}
- Pillar: ${post.pillar ?? 'unknown'}
- Hook (first 3 sec): ${post.hook ? `"${post.hook}"` : 'none set'}
- Effort: ${post.effort ?? 'unknown'}

David's rough notes / talking points:
"${roughNotes}"

Write a complete teleprompter script for this video. Format it like this:

**[HOOK]**
(The opening 3–5 seconds — punchy, scroll-stopping)

**[BODY]**
(The main content — broken into short readable chunks with line breaks between thoughts. Written to be spoken naturally out loud. No jargon. Each chunk is 1–3 sentences max so it's easy to read on a teleprompter.)

**[CTA]**
(The call to action — direct, specific, one or two sentences)

Use David's voice. Keep it concise. Write it to be read aloud — no bullet points, no headers inside sections except the ones above. Estimated read time: ${post.type === 'short' || post.type === 'reel' ? '30–60 seconds' : '60–120 seconds'}.`

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
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? ''
}
