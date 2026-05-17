import { useState, useEffect } from 'react'
import { Flame, BookmarkPlus, BookmarkCheck, RefreshCw, Loader2, Clock } from 'lucide-react'
import { generateViralIdeas } from '../../lib/generateViralIdeas.js'
import { formatDistanceToNow, differenceInDays, parseISO } from 'date-fns'

const TWO_WEEKS_DAYS = 14

const VIRALITY_STYLE = {
  'Insane':    'bg-red-900/40 text-red-400 border-red-700/40',
  'Very High': 'bg-orange-900/30 text-orange-400 border-orange-700/30',
  'High':      'bg-tan/10 text-tan border-tan/25',
}

const PLATFORM_STYLE = {
  IG:     'bg-pink-950/50 text-pink-300',
  TikTok: 'bg-cyan-950/50 text-cyan-300',
  YT:     'bg-red-950/50 text-red-300',
}

const FALLBACK_IDEAS = [
  {
    id: 1, format: 'The World Record Breakdown', virality: 'Insane',
    platforms: ['YT', 'IG', 'TikTok'],
    hook: '"I broke the world record in archery twice. Here\'s the exact training, mindset, and gear I used the week before each one."',
    why: 'You\'re the only person on earth who can make this video. No one can copy it, and it signals authority to every new follower who finds you.',
    pillars: ['Personal Brand', 'Education'],
  },
  {
    id: 2, format: 'The Honest Miss', virality: 'Very High',
    platforms: ['IG', 'TikTok'],
    hook: '"I missed a 160-inch whitetail at 28 yards. I\'m going to show you exactly what went wrong — and why I\'m grateful it happened."',
    why: 'Every hunting creator shows the kill. Almost none show the miss. Vulnerability is the fastest way to build a loyal audience.',
    pillars: ['Personal Brand', 'Hunting'],
  },
  {
    id: 3, format: 'Gear Tier List', virality: 'Very High',
    platforms: ['IG', 'TikTok', 'YT'],
    hook: '"I\'ve shot every major broadhead on the market. Here\'s my honest tier list — some of these answers will surprise you."',
    why: 'Opinion-based content drives insane comment volume. Tier lists get rewatched and shared. Your credibility as world record holder makes it carry more weight.',
    pillars: ['Product Demo', 'Education'],
  },
]

function loadStored() {
  try {
    const raw = localStorage.getItem('viral_ideas_v2')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function saveStored(ideas, updatedAt) {
  try {
    localStorage.setItem('viral_ideas_v2', JSON.stringify({ ideas, updatedAt }))
  } catch {}
}

export default function ViralWatch() {
  const stored = loadStored()

  const [ideas,     setIdeas]     = useState(stored?.ideas ?? FALLBACK_IDEAS)
  const [updatedAt, setUpdatedAt] = useState(stored?.updatedAt ?? null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [saved,     setSaved]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('viral_saved') || '{}') } catch { return {} }
  })

  // Auto-refresh if no data or stale by 2+ weeks
  useEffect(() => {
    const isStale = !updatedAt || differenceInDays(new Date(), parseISO(updatedAt)) >= TWO_WEEKS_DAYS
    if (isStale) handleRefresh()
  }, []) // eslint-disable-line

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    try {
      const fresh = await generateViralIdeas()
      const now = new Date().toISOString()
      setIdeas(fresh)
      setUpdatedAt(now)
      saveStored(fresh, now)
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key to .env.local to enable AI refresh' : e.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleSaved(id) {
    setSaved(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem('viral_saved', JSON.stringify(next))
      return next
    })
  }

  const savedCount = Object.values(saved).filter(Boolean).length
  const daysSince  = updatedAt ? differenceInDays(new Date(), parseISO(updatedAt)) : null
  const nextRefresh = updatedAt ? Math.max(0, TWO_WEEKS_DAYS - (daysSince ?? 0)) : 0

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-700/30 flex items-center justify-center shrink-0">
            <Flame size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-100">Viral Watch</h1>
            <p className="text-sm text-tac-200 mt-0.5">
              AI-refreshed every 2 weeks · {ideas.length} formats tailored to your brand
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedCount > 0 && (
            <span className="text-xs bg-flo/10 text-flo font-semibold px-3 py-1.5 rounded-full border border-flo/25">
              {savedCount} saved
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-tac-800 border border-tac-700 hover:border-tac-500 text-tac-200 hover:text-stone-100 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {loading ? 'Refreshing…' : 'Refresh now'}
          </button>
        </div>
      </div>

      {/* Last updated bar */}
      <div className="flex items-center gap-2 mb-5 text-xs text-tac-500">
        <Clock size={11} />
        {updatedAt
          ? <>Last updated {formatDistanceToNow(parseISO(updatedAt), { addSuffix: true })} · Next auto-refresh in {nextRefresh} day{nextRefresh !== 1 ? 's' : ''}</>
          : 'Generating fresh ideas…'
        }
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-900/20 border border-red-700/30 rounded-xl text-xs text-red-400">{error}</div>
      )}

      {/* Ideas list */}
      <div className="space-y-4">
        {ideas.map((item, i) => (
          <div
            key={item.id}
            className={`bg-tac-800 rounded-2xl border overflow-hidden transition-colors ${
              saved[item.id] ? 'border-flo/25' : 'border-tac-700 hover:border-tac-500'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-tac-700 border border-tac-600 flex items-center justify-center text-xs font-bold text-tac-200 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-stone-100 text-base">{item.format}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${VIRALITY_STYLE[item.virality] ?? VIRALITY_STYLE['High']}`}>
                      {item.virality}
                    </span>
                    <div className="flex gap-1 ml-auto flex-wrap">
                      {(item.platforms ?? []).map(p => (
                        <span key={p} className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLATFORM_STYLE[p] ?? 'bg-tac-700 text-tac-100'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-tan/5 border-l-2 border-tan rounded-r-xl px-4 py-2.5 mb-3">
                    <p className="text-xs font-semibold text-tan uppercase tracking-wide mb-1">Hook</p>
                    <p className="text-sm text-tac-100 italic leading-relaxed">{item.hook}</p>
                  </div>

                  <p className="text-sm text-tac-200 leading-relaxed mb-3">{item.why}</p>

                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {(item.pillars ?? []).map(p => (
                        <span key={p} className="text-xs text-tan bg-tan/10 px-2.5 py-0.5 rounded-full font-medium border border-tan/20">
                          {p}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleSaved(item.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                        saved[item.id]
                          ? 'bg-flo text-tac-950 border-flo'
                          : 'bg-tac-700 border-tac-600 text-tac-200 hover:border-flo/30 hover:text-flo'
                      }`}
                    >
                      {saved[item.id]
                        ? <><BookmarkCheck size={12} /> Saved</>
                        : <><BookmarkPlus size={12} /> Save idea</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && (
        <div className="mt-6 p-4 bg-tac-800 rounded-2xl border border-tac-700 text-center">
          <p className="text-xs text-tac-400">
            Auto-refreshes every 2 weeks with fresh AI-generated formats tailored to your brand. Hit "Refresh now" anytime to pull new ideas.
          </p>
        </div>
      )}
    </div>
  )
}
