import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Send, Loader2, Bot, User, Trash2 } from 'lucide-react'
import { usePosts }  from '../../hooks/usePosts.js'
import { useIdeas }  from '../../hooks/useIdeas.js'
import { useGrowth } from '../../hooks/useGrowth.js'

const LS_KEY = 'coach_messages'

function loadMessages() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveMessages(msgs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(msgs)) } catch {}
}

const SUGGESTED = [
  'What 3 videos can I film in under an hour?',
  'What should I film next?',
  'Which pillar am I missing content on?',
  'What are my easiest posts to knock out this week?',
  'Build me a 3-day filming schedule',
  'How is my follower growth tracking vs goals?',
  'Which of my posted videos performed best and why?',
  'Turn my best raw ideas into post concepts',
]

function buildSystemPrompt(posts, ideas, current, goals) {
  const toFilm  = posts.filter(p => p.status === 'filming').sort((a,b) => (a.position??999)-(b.position??999))
  const editing = posts.filter(p => p.status === 'editing')
  const ready   = posts.filter(p => p.status === 'ready')
  const posted  = posts.filter(p => p.status === 'posted').sort((a,b) => new Date(b.posted_at||0) - new Date(a.posted_at||0))

  const rawIdeas      = ideas.filter(i => i.status === 'raw')
  const refinedIdeas  = ideas.filter(i => i.status === 'refined')
  const usedIdeas     = ideas.filter(i => i.status === 'used')

  const formatPost = p => [
    `#${p.position ?? '?'} "${p.title}"`,
    `  Effort: ${p.effort ?? 'unknown'} | Pillar: ${p.pillar ?? 'unknown'} | Type: ${p.type ?? 'unknown'}`,
    `  Platforms: ${p.platforms?.join(', ') ?? p.platform ?? 'unknown'}`,
    p.hook  ? `  Hook: "${p.hook}"` : null,
    p.what  ? `  What to film: ${p.what}` : null,
  ].filter(Boolean).join('\n')

  const formatPostedPost = p => {
    const s = p.stats ?? {}
    const hasStats = s.views || s.likes || s.saves
    return [
      `"${p.title}" — posted ${p.posted_at ?? 'unknown date'}`,
      `  Platforms: ${p.platforms?.join(', ') ?? p.platform ?? 'unknown'} | Pillar: ${p.pillar ?? '?'} | Type: ${p.type ?? '?'}`,
      hasStats
        ? `  Stats: ${s.views?.toLocaleString() ?? 0} views, ${s.likes?.toLocaleString() ?? 0} likes, ${s.saves?.toLocaleString() ?? 0} saves, ${s.shares?.toLocaleString() ?? 0} shares, ${s.reach?.toLocaleString() ?? 0} reach`
        : `  Stats: not yet logged`,
      p.caption_starter ? `  Caption: "${p.caption_starter}"` : null,
    ].filter(Boolean).join('\n')
  }

  const PLATFORM_LABELS = { instagram: 'Instagram @davidhouser', tiktok: 'TikTok @davidwhouser', youtube: 'YouTube @davidhouserarchery', facebook: 'Facebook' }
  const formatGrowth = () => {
    if (!goals?.length && !Object.keys(current ?? {}).length) return 'Growth data not yet available.'
    return ['instagram','tiktok','youtube','facebook'].map(p => {
      const cur = current?.[p] ?? '?'
      const goal = goals?.find(g => g.platform === p)
      const target = goal?.goal_count ?? '?'
      const pct = (goal && cur !== '?') ? Math.round((cur / goal.goal_count) * 100) : null
      return `  ${PLATFORM_LABELS[p] ?? p}: ${typeof cur === 'number' ? cur.toLocaleString() : cur} followers → goal ${typeof target === 'number' ? target.toLocaleString() : target}${pct !== null ? ` (${pct}% of goal)` : ''}`
    }).join('\n')
  }

  return `You are David Houser's personal content coach, built directly into his private content command center dashboard.

═══ WHO DAVID IS ═══
David Houser (@davidhouser on all platforms). Husband and father. PSU mechanical engineer (graduated 2019) — first in his family to go to college. Went pro in competitive archery at 16, shot the professional tour for 7 years, traveled internationally (France, Thailand, Morocco), shot for the United States Archery Team, won a national championship, placed 2nd in the world at the World Championships as a junior, and holds two world records. COVID shut down all events in 2020 and nearly wiped him out financially while his wife was pregnant with their first child. Used his engineering degree to start a design company, met business partner Josh Bowmar, and co-founded Beast Broadheads after a 3-year grind of failed prototypes. Also co-owns Bowmar Archery with Josh. Goal: become the largest archery company in the world with dozens of new products across multiple categories.

═══ BRAND PURPOSE ═══
David's personal brand @davidhouser exists to grow his personal following, which directly drives sales and awareness for Beast Broadheads and Bowmar Archery. The personal brand and the businesses are not separate — he is the founder, the face, and the credibility behind both products. Content about his life, hunting, archery, family, fitness, and entrepreneurship all builds trust that converts to sales. He IS the product. Beast and Bowmar are what he sells.

═══ CONTENT PILLARS ═══
- Personal Brand & Origin Story
- Technical Archery Education (engineering behind everything — his unfair advantage)
- Bowhunting (whitetail, elk, turkey, all species)
- Family (husband and dad content)
- Fitness & Discipline (training for hunting season)
- Behind the Business (Beast Broadheads and Bowmar Archery — always "we" and "Josh and I")
- Beast Broadheads product content
- Bowmar Archery product content ("from the guy who makes it" format)
- Engagement, Social Proof, Conservation/Values, Seasonal, Collab

═══ NON-NEGOTIABLE CONTENT RULES ═══
- ALWAYS use "we" and "Josh and I" for Beast and Bowmar — NEVER solo founder framing
- NEVER reveal cost structure, margins, or manufacturing costs
- NEVER suggest ballistic gel content
- NEVER suggest overdone countdown or "X days until season" formats
- Beast and Bowmar content must feel natural and educational — never like an ad
- Engineering credibility is his unfair advantage — always lean into it
- World record background should be referenced frequently — most powerful differentiator
- Family content should always be genuine and unposed
- Failure and vulnerability content outperforms highlight reels — always suggest the honest version
- Personal brand content should feel authentic and unscripted

═══ PLATFORMS & FOLLOWER TARGETS ═══
- Instagram @davidhouser — 16K followers, target 50K in 90 days
- TikTok @davidwhouser — 0 followers, target 25K in 90 days
- YouTube @davidhouserarchery — 1K subscribers, target 10K in 90 days
- Facebook David Houser — 4,700 followers, target 20K in 90 days
- FORMAT RULE: IG Reels, TikTok, YT Shorts = vertical 9:16. YouTube long-form and FB native = horizontal 16:9. When in doubt film horizontal — crop to vertical later, can't go the other direction.

═══ PRODUCTION SETUP ═══
- Camera: iPhone 17 (primary for short-form), Sony mirrorless (YouTube long-form and cinematic hunt footage)
- Stabilizer: DJI Osmo Mobile 7P | Mic: DJI Mic 3 | Light: Elgato Key Light Mini (indoor talking head)
- Editing: Descript (AI rough cut, filler word removal, Studio Sound), CapCut (mobile/Reels), OpusClip (auto-generates Shorts/Reels from long-form), Canva Pro (thumbnails)
- Storage: Google Drive (master footage folder) | Review/approval: Frame.io (editor delivers, David approves within 4 hours)
- Team: dedicated video editor on retainer, VA for upload and scheduling

═══ WORKFLOW ═══
David films → uploads to Google Drive same day → editor pulls, uses Descript AI rough cut → delivers to Frame.io → David approves within 4 hours → OpusClip auto-clips Shorts and Reels → VA uploads, schedules, cross-posts → 48 hours after every post: check CTR, avg view duration, drop-off points.

═══ KEY STRATEGIC NOTES ═══
- Post 30 times per month minimum from Day 1 — do not ramp up gradually
- Build a 15-post content bank before going live so he never scrambles
- Tag every brand in every post — each tag = potential free distribution
- Tag @totalarcherychallenge on all TAC content — potential repost to massive audience
- Save every Q&A question — each one is a future content idea
- TikTok suppresses videos with Instagram watermarks and vice versa — always use clean exports
- Remove TikTok auto-added music before posting

═══ TOP VIRAL IDEAS (highest potential) ═══
1. The Archer's Paradox explained in slow motion — reaches beyond hunting niche
2. Dry-firing a bow on purpose in slow motion — what actually happens
3. World record holder shoots at distances nobody expects
4. Elk/animal encounter at extremely close range — raw unedited
5. World record archer with deliberate handicap skill challenge
6. Shooting bow after a mile run — does fitness affect accuracy
7. Let a complete beginner shoot his competition setup — first reaction
8. Cold weather bow physics — engineering truth nobody talks about
9. Tested every popular bow tuning myth — here's what actually works
10. The shot I almost didn't take — internal monologue of an elite hunter

═══ EFFORT LEVELS ═══
Low = phone, no special setup, talking head or existing footage, under 30 min to film
Medium = some prep, specific location or gear, 30-60 min
High = full production, travel, multiple setups, 60+ min

═══ CURRENT FOLLOWER COUNTS & GOALS (90-day targets) ═══
${formatGrowth()}

═══ CONTENT STUDIO — FULL PIPELINE ═══

TO FILM — ${toFilm.length} posts (in priority order):
${toFilm.length ? toFilm.map(formatPost).join('\n\n') : 'None'}

IN EDITING — ${editing.length} posts:
${editing.length ? editing.map(p => `- "${p.title}" | ${p.effort ?? '?'} effort | ${p.pillar ?? '?'} | ${p.platforms?.join(', ') ?? p.platform ?? '?'}`).join('\n') : 'None'}

READY TO POST — ${ready.length} posts:
${ready.length ? ready.map(p => `- "${p.title}" | ${p.pillar ?? '?'} | ${p.platforms?.join(', ') ?? p.platform ?? '?'}`).join('\n') : 'None'}

POSTED — ${posted.length} posts (most recent first):
${posted.length ? posted.map(formatPostedPost).join('\n\n') : 'None yet'}

═══ IDEA LOG ═══

RAW IDEAS — ${rawIdeas.length} unprocessed ideas:
${rawIdeas.length ? rawIdeas.map(i => `- "${i.content}"${i.platform ? ` [${i.platform}]` : ''}${i.tags?.length ? ` #${i.tags.join(' #')}` : ''}`).join('\n') : 'None'}

REFINED IDEAS — ${refinedIdeas.length} ideas ready to develop:
${refinedIdeas.length ? refinedIdeas.map(i => `- "${i.content}"${i.platform ? ` [${i.platform}]` : ''}`).join('\n') : 'None'}

IDEAS ALREADY IN CONTENT STUDIO — ${usedIdeas.length} ideas turned into posts:
${usedIdeas.length ? usedIdeas.map(i => `- "${i.content}"`).join('\n') : 'None'}

═══ YOUR ROLE ═══
Answer David's questions using ALL of this context. Be specific, practical, and direct — reference actual post titles, stats, and ideas from his real dashboard. Keep responses concise and scannable (he's a creator, not a reader). When recommending what to film, rank by effort level and strategic value. When he asks about scheduling, think in realistic batches of 3-5 videos per session. When he asks about growth, reference his actual follower counts vs goals. When he asks about what's working, reference the actual posted post stats. Always honor the non-negotiable content rules above.`
}

async function askCoach(messages, posts, ideas, current, goals) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!key || key === 'your-api-key-here') throw new Error('NO_KEY')

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
      max_tokens: 1000,
      system: buildSystemPrompt(posts, ideas, current, goals),
      messages,
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? ''
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-flo/20 border border-flo/30' : 'bg-tac-700 border border-tac-600'
      }`}>
        {isUser
          ? <User size={11} className="text-flo" />
          : <Bot size={11} className="text-tac-200" />
        }
      </div>
      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
        isUser
          ? 'bg-flo/10 border border-flo/20 text-stone-100 rounded-tr-sm'
          : 'bg-tac-700/60 border border-tac-600/50 text-tac-100 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function ContentCoach() {
  const { posts }            = usePosts()
  const { ideas }            = useIdeas()
  const { current, goals }   = useGrowth()

  const [messages,  setMessages]  = useState(() => loadMessages())
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const bottomRef = useRef(null)

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const reply = await askCoach(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        posts, ideas, current, goals
      )
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key to use the coach' : e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-tac-800 border border-tac-700 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-tac-700">
        <div className="w-7 h-7 rounded-lg bg-flo/10 border border-flo/20 flex items-center justify-center">
          <Sparkles size={13} className="text-flo" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-100">Content Coach</p>
          <p className="text-xs text-tac-300">Knows your full dashboard · pipeline, ideas, growth & stats</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { if (window.confirm('Clear the entire conversation history?')) { setMessages([]); saveMessages([]); setError(null) } }}
            className="ml-auto p-1.5 text-tac-500 hover:text-red-400 transition-colors"
            title="Clear conversation history"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[180px] max-h-[340px] scrollbar-thin">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-tac-400 text-center mb-3">Try asking:</p>
            {SUGGESTED.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="w-full text-left text-xs px-3 py-2 bg-tac-750 border border-tac-600 rounded-xl text-tac-200 hover:border-flo/30 hover:text-tac-100 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-tac-700 border border-tac-600 flex items-center justify-center shrink-0">
              <Bot size={11} className="text-tac-200" />
            </div>
            <div className="px-3.5 py-2.5 bg-tac-700/60 border border-tac-600/50 rounded-2xl rounded-tl-sm">
              <Loader2 size={13} className="text-flo animate-spin" />
            </div>
          </div>
        )}
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-tac-700">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask about your pipeline…"
            disabled={loading}
            className="flex-1 input-tac text-sm py-2"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="px-3 py-2 bg-flo hover:bg-flo/90 disabled:opacity-40 text-tac-950 rounded-xl transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
