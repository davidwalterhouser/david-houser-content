import { useState } from 'react'
import { ExternalLink, Crown, Flame, Gem, Zap, ChevronDown, ChevronUp, Save, CalendarDays, Pencil } from 'lucide-react'
import { formatDistanceToNow, format, parseISO } from 'date-fns'

const PLATFORM_COLORS = {
  instagram: '#ec4899', tiktok: '#06b6d4', youtube: '#ef4444',
  facebook: '#3b82f6', multi: '#AAFF00',
}

const DEST_STYLES = {
  'IG Reel':'bg-pink-950/50 text-pink-300','IG Feed':'bg-pink-950/50 text-pink-300',
  'IG Carousel':'bg-pink-950/50 text-pink-300','IG Stories':'bg-pink-950/50 text-pink-300',
  'TikTok':'bg-cyan-950/50 text-cyan-300','YT Shorts':'bg-red-950/50 text-red-300',
  'YT':'bg-red-950/50 text-red-300','FB':'bg-blue-950/50 text-blue-300',
  'FB Video':'bg-blue-950/50 text-blue-300',
}

const STAT_FIELDS = [
  { key: 'views', label: 'Views' }, { key: 'likes', label: 'Likes' },
  { key: 'saves', label: 'Saves' }, { key: 'shares', label: 'Shares' },
  { key: 'comments', label: 'Comments' }, { key: 'reach', label: 'Reach' },
]

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 10000)   return (n / 1000).toFixed(0) + 'k'
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

function calcER(stats) {
  if (!stats?.views || stats.views === 0) return null
  return (((stats.likes ?? 0) + (stats.comments ?? 0) + (stats.saves ?? 0)) / stats.views) * 100
}

function ERPill({ er }) {
  if (er === null) return <span className="text-xs text-tac-300 italic">No stats yet</span>
  const r = er.toFixed(1)
  if (er >= 5)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-flo/15 text-flo border border-flo/25">{r}% ER</span>
  if (er >= 3)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-tan/15 text-tan border border-tan/25">{r}% ER</span>
  if (er >= 1)  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-700/30">{r}% ER</span>
  return              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-tac-700 text-tac-200 border border-tac-600">{r}% ER</span>
}

function MilestoneBadges({ stats }) {
  const badges = []
  if (stats?.views >= 10000) badges.push({ icon: Gem,   label: fmt(stats.views) + ' views', cls: 'bg-flo/10 text-flo border-flo/20' })
  const er = calcER(stats)
  if (er !== null && er >= 5) badges.push({ icon: Flame, label: 'Hot',                cls: 'bg-red-900/30 text-red-400 border-red-700/30' })
  if (stats?.saves >= 1000)   badges.push({ icon: Zap,   label: fmt(stats.saves) + ' saves', cls: 'bg-tan/10 text-tan border-tan/20' })
  if (!badges.length) return null
  return (
    <div className="flex gap-1 flex-wrap">
      {badges.map(({ icon: Icon, label, cls }, i) => (
        <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
          <Icon size={10} /> {label}
        </span>
      ))}
    </div>
  )
}

export default function PostedCard({ post, isTop, onUpdateStats, onUpdatePost }) {
  const [logging,  setLogging]  = useState(false)
  const [draft,    setDraft]    = useState(post.stats ?? {})
  const [urlEdit,  setUrlEdit]  = useState(false)
  const [url,      setUrl]      = useState(post.post_url ?? '')
  const [dateEdit, setDateEdit] = useState(false)
  const [dateVal,  setDateVal]  = useState(post.posted_at ?? '')

  const color = PLATFORM_COLORS[post.platform] ?? PLATFORM_COLORS.multi
  const er    = calcER(post.stats)

  function saveStats() {
    const parsed = {}
    STAT_FIELDS.forEach(({ key }) => {
      const v = parseInt(draft[key], 10)
      if (!isNaN(v)) parsed[key] = v
    })
    onUpdateStats(post.id, parsed)
    setLogging(false)
  }

  function saveUrl() {
    onUpdatePost(post.id, { post_url: url })
    setUrlEdit(false)
  }

  function saveDate() {
    onUpdatePost(post.id, { posted_at: dateVal })
    setDateEdit(false)
  }

  return (
    <div className={`bg-tac-800 rounded-2xl overflow-hidden transition-all flex flex-col ${
      isTop ? 'ring-2 ring-flo ring-offset-1 ring-offset-tac-900 shadow-flo' : 'border border-tac-700 hover:border-tac-500'
    }`}>
      <div className="h-1.5 w-full" style={{ background: color }} />

      <div className="p-4 flex flex-col flex-1 gap-3">

        <div className="flex items-center gap-2">
          {isTop && (
            <span className="flex items-center gap-1 text-xs font-bold text-flo bg-flo/10 border border-flo/25 px-2 py-0.5 rounded-full">
              <Crown size={10} /> Top Post
            </span>
          )}
          {post.effort && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              post.effort === 'Low' ? 'bg-flo/10 text-flo' :
              post.effort === 'Medium' ? 'bg-tan/10 text-tan' : 'bg-red-900/40 text-red-400'
            }`}>{post.effort}</span>
          )}
          <div className="ml-auto flex items-center gap-1">
            {dateEdit ? (
              <>
                <input
                  type="date"
                  value={dateVal}
                  onChange={e => setDateVal(e.target.value)}
                  className="input-tac text-xs py-0.5 px-2 w-32"
                />
                <button onClick={saveDate} className="p-1 bg-flo text-tac-950 rounded-lg">
                  <Save size={10} />
                </button>
                <button onClick={() => setDateEdit(false)} className="p-1 text-tac-400 hover:text-tac-100">
                  ✕
                </button>
              </>
            ) : (
              <button
                onClick={() => setDateEdit(true)}
                className="flex items-center gap-1 text-xs text-tac-300 hover:text-flo transition-colors group"
              >
                <CalendarDays size={11} />
                {post.posted_at
                  ? <><span>{format(parseISO(post.posted_at), 'MMM d, yyyy')}</span><Pencil size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" /></>
                  : <span className="text-tac-500">Set posted date</span>
                }
              </button>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-stone-100 leading-snug line-clamp-2">{post.title}</p>
          {post.pillar && <p className="text-xs text-tac-200 mt-0.5">{post.pillar}</p>}
        </div>

        {post.platforms?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.platforms.map(pl => (
              <span key={pl} className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEST_STYLES[pl] ?? 'bg-tac-700 text-tac-100'}`}>
                {pl}
              </span>
            ))}
          </div>
        )}

        <MilestoneBadges stats={post.stats} />

        {post.stats && Object.keys(post.stats).some(k => post.stats[k] > 0) ? (
          <div className="grid grid-cols-3 gap-2">
            {STAT_FIELDS.map(({ key, label }) => (
              <div key={key} className="bg-tac-750 border border-tac-700 rounded-xl p-2.5 text-center">
                <p className="text-xs text-tac-200 mb-0.5">{label}</p>
                <p className="text-sm font-bold text-stone-100">{fmt(post.stats[key])}</p>
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setLogging(true)}
            className="w-full text-xs text-tac-300 border border-dashed border-tac-600 rounded-xl py-3 hover:border-flo/40 hover:text-flo transition-colors"
          >
            + Log first stats
          </button>
        )}

        <div className="flex items-center justify-between gap-2">
          <ERPill er={er} />
          {post.post_url ? (
            <a href={post.post_url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 text-xs text-tac-300 hover:text-flo transition-colors">
              <ExternalLink size={12} /> Open post
            </a>
          ) : (
            <button onClick={() => setUrlEdit(v => !v)} className="text-xs text-tac-400 hover:text-tac-100 transition-colors">
              + Add link
            </button>
          )}
        </div>

        {urlEdit && (
          <div className="flex gap-2">
            <input autoFocus value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUrl()}
              placeholder="https://instagram.com/p/..."
              className="input-tac flex-1" />
            <button onClick={saveUrl} className="p-1.5 bg-flo text-tac-950 rounded-lg hover:bg-flo/90">
              <Save size={12} />
            </button>
          </div>
        )}

        {post.stats && Object.keys(post.stats).some(k => post.stats[k] > 0) && (
          <button onClick={() => setLogging(v => !v)}
            className="flex items-center gap-1 text-xs text-tac-300 hover:text-flo transition-colors">
            {logging ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {logging ? 'Cancel' : 'Update stats'}
          </button>
        )}

        {logging && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-3 gap-2">
              {STAT_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs text-tac-200 block mb-1">{label}</label>
                  <input type="number" value={draft[key] ?? ''}
                    onChange={e => setDraft(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="0" className="input-tac w-full" />
                </div>
              ))}
            </div>
            <button onClick={saveStats}
              className="w-full py-2 bg-flo hover:bg-flo/90 text-tac-950 text-xs font-bold rounded-xl transition-colors">
              Save stats
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
