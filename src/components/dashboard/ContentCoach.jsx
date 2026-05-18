import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Loader2, Bot, User, RotateCcw } from 'lucide-react'

const SUGGESTED = [
  'What 3 videos can I film in under an hour?',
  'What should I film next?',
  'Which pillar am I missing content on?',
  'What are my easiest posts to knock out this week?',
  'Build me a 3-day filming schedule',
]

function buildSystemPrompt(posts) {
  const toFilm  = posts.filter(p => p.status === 'filming').sort((a,b) => (a.position??999)-(b.position??999))
  const editing = posts.filter(p => p.status === 'editing')
  const ready   = posts.filter(p => p.status === 'ready')

  const formatPost = p => [
    `#${p.position ?? '?'} "${p.title}"`,
    `  Effort: ${p.effort ?? 'unknown'} | Pillar: ${p.pillar ?? 'unknown'} | Type: ${p.type ?? 'unknown'}`,
    `  Platforms: ${p.platforms?.join(', ') ?? p.platform ?? 'unknown'}`,
    p.hook  ? `  Hook: "${p.hook}"` : null,
    p.what  ? `  What to film: ${p.what}` : null,
  ].filter(Boolean).join('\n')

  return `You are David Houser's personal content coach — built directly into his content dashboard.

About David:
- 2× world record archer, founder of Beast Broadheads, competitive bowhunter, husband and father
- Building a personal brand in the hunting/archery/high-performance space
- Content pillars: Personal Brand, Education, Fitness & Grind, Family, Behind the Business, Engagement, Social Proof, Conservation/Values, Seasonal, Product Demo, Bowmar, Hunting, Collab
- Platforms: Instagram, TikTok, YouTube, Facebook
- Effort levels: Low = minimal setup/gear, Medium = some prep, High = full production

Current pipeline:

TO FILM (${toFilm.length} posts):
${toFilm.map(formatPost).join('\n\n')}

IN EDITING (${editing.length} posts):
${editing.map(p => `- "${p.title}"`).join('\n') || 'None'}

READY TO POST (${ready.length} posts):
${ready.map(p => `- "${p.title}"`).join('\n') || 'None'}

Your job: Answer David's questions about his content using this real data. Be specific, practical, and direct. Reference actual post titles and details from his pipeline. Keep responses concise — he's a creator, not a reader. Use line breaks to keep it scannable. If he asks what to film, rank by effort and strategic value. If he asks about scheduling, think in realistic creator batches (3-5 videos per session).`
}

async function askCoach(messages, posts) {
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
      system: buildSystemPrompt(posts),
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

export default function ContentCoach({ posts }) {
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const bottomRef = useRef(null)

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
        posts
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
          <p className="text-xs text-tac-300">Knows your full pipeline · ask anything</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null) }}
            className="ml-auto p-1.5 text-tac-400 hover:text-tac-100 transition-colors"
            title="Clear chat"
          >
            <RotateCcw size={13} />
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
