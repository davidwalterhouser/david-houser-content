import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, Sparkles, Copy, Check, FileText, ScrollText, Lock, Trash2, Send, Bot, User, RefreshCw } from 'lucide-react'
import { usePosts }      from '../../hooks/usePosts.js'
import { useBrandNotes } from '../../hooks/useBrandNotes.js'
import VoiceDictation from '../ideas/VoiceDictation.jsx'

const STATUS_DOT = {
  filming: 'bg-tan',
  editing: 'bg-blue-400',
  ready:   'bg-flo',
  posted:  'bg-tac-500',
}

// ── Per-post chat history in localStorage ────────────────────────────────────
function loadChat(postId) {
  try { return JSON.parse(localStorage.getItem(`script_chat_${postId}`) || '[]') } catch { return [] }
}
function saveChat(postId, msgs) {
  try { localStorage.setItem(`script_chat_${postId}`, JSON.stringify(msgs)) } catch {}
}
function clearChat(postId) {
  try { localStorage.removeItem(`script_chat_${postId}`) } catch {}
}

// ── API call ──────────────────────────────────────────────────────────────────
function buildSystemPrompt(post, brandNotes) {
  const duration = (post.type === 'short' || post.type === 'reel') ? '30–60 seconds' : '60–120 seconds'
  const platforms = post.platforms?.join(', ') ?? post.platform ?? 'unknown'

  return `You are David Houser's personal teleprompter script writer, built into his content dashboard.

WHO DAVID IS:
2× world record archer. PSU mechanical engineer. Went pro at 16. 7 years on the pro tour. Co-founder of Beast Broadheads and Bowmar Archery with partner Josh Bowmar. Husband and father. Almost lost everything when COVID killed all archery events in 2020 while his wife was pregnant. Built Beast from scratch over 3 years of failed prototypes. Goal: largest archery company in the world.

DAVID'S VOICE:
Authentic. Confident. Direct. High-performance. Speaks like a hunter talking to hunters — not corporate, not salesy, not performative. Engineering credibility is his unfair advantage. World records get referenced naturally. "We" and "Josh and I" for Beast/Bowmar — never solo framing. Failure and vulnerability outperform highlight reels. Short punchy sentences. Written to be READ ALOUD on a teleprompter.

SCRIPT FORMAT (always use this):
**[HOOK]**
(Opening 3–5 seconds — punchy, scroll-stopping, matches the post hook below)

**[BODY]**
(Main content — short readable chunks, 1–3 sentences per chunk, line breaks between thoughts, no bullet points inside)

**[CTA]**
(One or two sentences — direct, specific call to action)

THIS POST:
- Title: "${post.title}"
- Type: ${post.type ?? 'reel'} | Platform: ${platforms} | Pillar: ${post.pillar ?? 'unknown'}
- Effort: ${post.effort ?? 'unknown'} | Target length: ${duration}
- Hook (first 3 sec): ${post.hook ? `"${post.hook}"` : 'not set'}
- What to film: ${post.what ?? 'not set'}
- Caption starter: ${post.caption_starter ?? 'not set'}

${brandNotes?.length ? `DAVID'S OWN FEEDBACK LOG (treat as highest priority):
${brandNotes.map(n => `[${n.category.toUpperCase().replace('_',' ')}] ${n.content}`).join('\n')}` : ''}

YOUR RULES:
1. When asked to write the first draft — write the full script using the format above.
2. When David gives feedback — make ONLY the specific changes he asked for. Do NOT rewrite sections he didn't mention. Preserve everything he didn't complain about.
3. Output ONLY the script itself. No "Here's the revised version:" or any preamble. Just the script.
4. Never write bullet points inside the script body — only flowing sentences.
5. Keep it conversational and speakable — read it aloud in your head before outputting.`
}

async function callScriptChat(messages, post, brandNotes) {
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
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: buildSystemPrompt(post, brandNotes),
      messages,
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content?.[0]?.text?.trim() ?? ''
}

// ── Script renderer ───────────────────────────────────────────────────────────
function renderScript(text) {
  return String(text).split('\n').map((line, i) => {
    if (/^\*\*\[.+\]\*\*/.test(line)) {
      return <p key={i} className="text-xs font-bold text-flo uppercase tracking-widest mt-5 mb-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>
    }
    if (!line.trim()) return <div key={i} className="h-2" />
    return <p key={i} className="text-base leading-relaxed text-stone-100">{line}</p>
  })
}

// ── Message bubble ────────────────────────────────────────────────────────────
function ScriptMessage({ msg, onLock, locked }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(msg.content.replace(/\*\*/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-flo/20 border border-flo/30' : 'bg-tac-700 border border-tac-600'
      }`}>
        {isUser ? <User size={11} className="text-flo" /> : <Bot size={11} className="text-tac-200" />}
      </div>

      <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
        {isUser ? (
          <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm bg-flo/10 border border-flo/20 text-sm text-stone-100 leading-relaxed whitespace-pre-line">
            {msg.content}
          </div>
        ) : (
          <div className="bg-tac-750 border border-tac-700 rounded-2xl rounded-tl-sm overflow-hidden">
            <div className="p-4">
              {renderScript(msg.content)}
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 border-t border-tac-700 bg-tac-800/50">
              {locked ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-flo">
                  <Lock size={11} className="fill-flo" /> Locked as active script
                </span>
              ) : (
                <button
                  onClick={onLock}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-flo hover:bg-flo/90 text-tac-950 text-xs font-bold rounded-lg transition-colors"
                >
                  <Lock size={11} /> Lock Script
                </button>
              )}
              <button
                onClick={copy}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ml-auto ${
                  copied ? 'bg-flo/20 text-flo border-flo/30' : 'bg-tac-700 border-tac-600 text-tac-200 hover:bg-tac-600'
                }`}
              >
                {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ScriptView({ initialPostId }) {
  const { posts, updatePost }    = usePosts()
  const { notes: brandNotes }    = useBrandNotes()

  const [selectedId, setSelectedId] = useState(initialPostId ?? null)
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [lockedId,   setLockedId]   = useState(null)
  const bottomRef = useRef(null)

  const selected = posts.find(p => p.id === selectedId)

  // Load chat when post changes
  useEffect(() => {
    if (!selectedId) return
    const saved = loadChat(selectedId)
    setMessages(saved)
    setLockedId(null)
    setError(null)
    setInput('')
  }, [selectedId])

  useEffect(() => {
    if (initialPostId) setSelectedId(initialPostId)
  }, [initialPostId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleTranscript = useCallback((t) => {
    setInput(prev => prev ? prev + ' ' + t : t)
  }, [])

  const sortedPosts = [...posts].sort((a, b) => {
    const aPosted = a.status === 'posted' ? 1 : 0
    const bPosted = b.status === 'posted' ? 1 : 0
    if (aPosted !== bPosted) return aPosted - bPosted
    if (a.month !== b.month) return a.month - b.month
    return (a.position ?? 999) - (b.position ?? 999)
  })

  const filtered = sortedPosts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  async function startDraft() {
    if (!selected || loading) return
    setLoading(true)
    setError(null)
    const userMsg = { role: 'user', content: 'Write the first draft of my teleprompter script for this post.' }
    const newMessages = [userMsg]
    setMessages(newMessages)
    try {
      const reply = await callScriptChat(newMessages, selected, brandNotes)
      const updated = [...newMessages, { role: 'assistant', content: reply }]
      setMessages(updated)
      saveChat(selectedId, updated)
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key to .env.local' : e.message)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    if (!input.trim() || !selected || loading) return
    const content = input.trim()
    setInput('')
    setError(null)

    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const reply = await callScriptChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        selected, brandNotes
      )
      const updated = [...newMessages, { role: 'assistant', content: reply }]
      setMessages(updated)
      saveChat(selectedId, updated)
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key to .env.local' : e.message)
    } finally {
      setLoading(false)
    }
  }

  function lockScript(msgIndex) {
    const msg = messages[msgIndex]
    if (!msg || !selected) return
    const scriptText = msg.content
    const newVersion = { id: crypto.randomUUID(), text: scriptText, createdAt: new Date().toISOString() }
    const existing = selected.scripts ?? (selected.script ? [{ id: 'v0', text: selected.script, createdAt: null }] : [])
    updatePost(selected.id, { scripts: [...existing, newVersion], script: scriptText })
    setLockedId(msgIndex)
  }

  function resetChat() {
    if (!window.confirm('Clear this script conversation and start fresh?')) return
    clearChat(selectedId)
    setMessages([])
    setLockedId(null)
    setError(null)
  }

  const hasScript = selected && (selected.scripts?.length || selected.script)

  return (
    <div className="flex gap-5 h-[calc(100vh-200px)]">

      {/* Post list */}
      <div className="w-64 shrink-0 flex flex-col gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="input-tac w-full text-sm"
        />
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
          {filtered.map(post => {
            const hasScript = post.scripts?.length || post.script
            return (
              <button
                key={post.id}
                onClick={() => setSelectedId(post.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  selectedId === post.id
                    ? 'bg-flo/10 border-flo/30 text-stone-100'
                    : 'bg-tac-800 border-tac-700 text-tac-200 hover:border-tac-500 hover:text-tac-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[post.status] ?? 'bg-tac-500'}`} />
                  <span className="text-xs text-tac-400 capitalize">{post.status}</span>
                  {hasScript && <ScrollText size={9} className="text-flo/70" />}
                  {post.position && (
                    <span className="ml-auto text-xs font-bold text-flo bg-flo/10 px-1.5 rounded">#{post.position}</span>
                  )}
                </div>
                <p className="text-xs leading-snug line-clamp-2">{post.title}</p>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-tac-500 text-center py-8">No posts found</p>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <FileText size={36} className="text-tac-600" />
            <p className="text-tac-400 text-sm">Select a post to start writing its script</p>
          </div>
        ) : (
          <>
            {/* Post header */}
            <div className="bg-tac-800 border border-tac-700 rounded-xl px-4 py-3 mb-4 shrink-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[selected.status] ?? 'bg-tac-500'}`} />
                <span className="text-xs text-tac-400 capitalize">{selected.status} · {selected.platform} · {selected.type}</span>
                {messages.length > 0 && (
                  <button
                    onClick={resetChat}
                    className="ml-auto flex items-center gap-1 text-xs text-tac-500 hover:text-red-400 transition-colors"
                  >
                    <RefreshCw size={10} /> Start over
                  </button>
                )}
              </div>
              <p className="text-sm font-semibold text-stone-100">{selected.title}</p>
              {selected.hook && (
                <p className="text-xs text-tan italic mt-1 truncate">Hook: "{selected.hook}"</p>
              )}
            </div>

            {/* Empty state — no chat yet */}
            {messages.length === 0 && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-flo/10 border border-flo/20 flex items-center justify-center">
                  <Sparkles size={24} className="text-flo" />
                </div>
                <div>
                  <p className="text-stone-100 font-semibold mb-1">Ready to write your script</p>
                  <p className="text-sm text-tac-300 max-w-sm">
                    Start with a first draft, then tweak it conversationally. Tell it exactly what to change — it won't rewrite what's already working.
                  </p>
                </div>
                {hasScript && (
                  <p className="text-xs text-tac-400">You have a saved script — start a new conversation to revise it</p>
                )}
                <button
                  onClick={startDraft}
                  className="flex items-center gap-2 px-6 py-2.5 bg-flo hover:bg-flo/90 text-tac-950 text-sm font-bold rounded-xl transition-colors"
                >
                  <Sparkles size={14} /> Write First Draft
                </button>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
            )}

            {/* Chat messages */}
            {(messages.length > 0 || loading) && (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin mb-4">
                  {messages.map((msg, i) => (
                    <ScriptMessage
                      key={i}
                      msg={msg}
                      onLock={() => lockScript(i)}
                      locked={lockedId === i}
                    />
                  ))}
                  {loading && (
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-tac-700 border border-tac-600 flex items-center justify-center shrink-0">
                        <Bot size={11} className="text-tac-200" />
                      </div>
                      <div className="px-3.5 py-2.5 bg-tac-750 border border-tac-700 rounded-2xl rounded-tl-sm">
                        <Loader2 size={13} className="text-flo animate-spin" />
                      </div>
                    </div>
                  )}
                  {error && <p className="text-xs text-red-400 text-center">{error}</p>}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                      placeholder="e.g. 'Make the hook more aggressive' or 'Cut the middle section' or 'Add a line about the world record'…"
                      disabled={loading}
                      className="flex-1 input-tac text-sm py-2"
                    />
                    <button
                      onClick={send}
                      disabled={!input.trim() || loading}
                      className="px-3 py-2 bg-flo hover:bg-flo/90 disabled:opacity-40 text-tac-950 rounded-xl transition-colors"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <VoiceDictation onTranscript={handleTranscript} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
