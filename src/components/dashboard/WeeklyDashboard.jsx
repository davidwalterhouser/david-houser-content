import { useMemo } from 'react'
import { Camera, Scissors, CheckCircle2, Trophy, Zap } from 'lucide-react'
import { usePosts } from '../../hooks/usePosts.js'
import { format } from 'date-fns'
import ContentCoach from './ContentCoach.jsx'

const DEST_STYLES = {
  'IG Reel':     'bg-pink-950/50 text-pink-300',
  'IG Feed':     'bg-pink-950/50 text-pink-300',
  'IG Carousel': 'bg-pink-950/50 text-pink-300',
  'IG Stories':  'bg-pink-950/50 text-pink-300',
  'TikTok':      'bg-cyan-950/50 text-cyan-300',
  'YT Shorts':   'bg-red-950/50 text-red-300',
  'YT':          'bg-red-950/50 text-red-300',
  'FB':          'bg-blue-950/50 text-blue-300',
  'FB Video':    'bg-blue-950/50 text-blue-300',
}

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

function SectionHeader({ icon: Icon, label, color, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={14} className="text-tac-950" />
      </div>
      <span className="font-semibold text-stone-100 text-sm">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs font-medium text-tac-200 bg-tac-700 px-2 py-0.5 rounded-full border border-tac-600">
          {count}
        </span>
      )}
    </div>
  )
}

function PostRow({ post, accent }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:border-tac-500 ${
      accent ?? 'bg-tac-750 border-tac-700'
    }`}>
      {post.position && (
        <span className="text-xs font-bold text-tac-300 w-5 text-right shrink-0 mt-0.5">
          #{post.position}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-100 leading-snug truncate">{post.title}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {post.effort && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              post.effort === 'Low'    ? 'bg-flo/10 text-flo' :
              post.effort === 'Medium' ? 'bg-tan/10 text-tan' :
                                        'bg-red-900/40 text-red-400'
            }`}>{post.effort}</span>
          )}
          {post.pillar && <span className="text-xs text-tac-200">{post.pillar}</span>}
        </div>
        {post.platforms?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {post.platforms.map(pl => (
              <span key={pl} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${DEST_STYLES[pl] ?? 'bg-tac-700 text-tac-100'}`}>
                {pl}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function WeeklyDashboard() {
  const { posts, loading } = usePosts()

  const filming = useMemo(() =>
    posts.filter(p => p.status === 'filming').sort((a, b) => (a.position ?? 999) - (b.position ?? 999)),
    [posts]
  )
  const editing = useMemo(() => posts.filter(p => p.status === 'editing'), [posts])
  const ready   = useMemo(() => posts.filter(p => p.status === 'ready'),   [posts])
  const posted  = useMemo(() => posts.filter(p => p.status === 'posted'),  [posts])

  const topPost = useMemo(() =>
    posted.reduce((best, p) => {
      if (!best) return p
      return (p.stats?.views ?? 0) > (best.stats?.views ?? 0) ? p : best
    }, null), [posted]
  )

  const topER      = topPost ? calcER(topPost.stats) : null
  const totalViews = posted.reduce((s, p) => s + (p.stats?.views ?? 0), 0)
  const erVals     = posted.map(p => calcER(p.stats)).filter(Boolean)
  const avgER      = erVals.length ? (erVals.reduce((s, e) => s + e, 0) / erVals.length).toFixed(1) : null
  const today      = format(new Date(), 'EEEE, MMMM d')

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-tac-200">Loading…</div>
  )

  return (
    <div className="p-6 max-w-5xl">

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-tac-200 mb-0.5 font-medium tracking-wide">{today}</p>
        <h1 className="text-3xl font-bold text-stone-100">Good morning, David.</h1>
        <p className="text-tac-200 mt-1">Here's where everything stands.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {[
          { label: 'In Progress',   value: filming.length + editing.length,       sub: 'filming + editing' },
          { label: 'Ready to Post', value: ready.length,                          sub: 'waiting on you' },
          { label: 'Total Views',   value: fmt(totalViews), sub: avgER ? `${avgER}% avg ER` : 'log stats to see ER' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-tac-800 border border-tac-700 rounded-2xl p-4 hover:border-tac-500 transition-colors">
            <p className="text-xs text-tac-200 font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-stone-100">{value}</p>
            <p className="text-xs text-tac-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">

        {/* Left */}
        <div className="space-y-5">

          {/* Film Next */}
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5">
            <SectionHeader icon={Camera} label="Film Next" color="bg-flo" count={filming.length} />
            {filming.length === 0 ? (
              <p className="text-sm text-tac-200 text-center py-4">Nothing left to film 🎉</p>
            ) : (
              <div className="space-y-2">
                {filming.slice(0, 5).map(p => <PostRow key={p.id} post={p} />)}
                {filming.length > 5 && (
                  <p className="text-xs text-tac-300 text-center pt-1">+{filming.length - 5} more in queue</p>
                )}
              </div>
            )}
          </div>

          {/* Ready to Post */}
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5">
            <SectionHeader icon={CheckCircle2} label="Ready to Post" color="bg-flo" count={ready.length} />
            {ready.length === 0 ? (
              <p className="text-sm text-tac-200 text-center py-4">Nothing ready yet — keep pushing through editing</p>
            ) : (
              <div className="space-y-2">
                {ready.slice(0, 4).map(p => (
                  <PostRow key={p.id} post={p} accent="bg-flo/5 border-flo/20" />
                ))}
                {ready.length > 4 && (
                  <p className="text-xs text-tac-300 text-center pt-1">+{ready.length - 4} more ready</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* Editor's Queue */}
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5">
            <SectionHeader icon={Scissors} label="Editor's Queue" color="bg-tan" count={editing.length} />
            {editing.length === 0 ? (
              <p className="text-sm text-tac-200 text-center py-4">Editor's clear — move something from Filming</p>
            ) : (
              <div className="space-y-2">
                {editing.slice(0, 4).map(p => <PostRow key={p.id} post={p} />)}
                {editing.length > 4 && (
                  <p className="text-xs text-tac-300 text-center pt-1">+{editing.length - 4} more in editing</p>
                )}
              </div>
            )}
          </div>

          {/* Top Performer */}
          {topPost && (
            <div className="relative bg-tac-800 border border-flo/20 rounded-2xl p-5 overflow-hidden hex-bg-subtle shadow-flo">
              <div className="absolute inset-0 bg-gradient-to-br from-flo/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={15} className="text-flo" />
                  <span className="text-sm font-semibold text-flo">Top Performer</span>
                </div>
                <p className="font-bold text-stone-100 leading-snug mb-3">{topPost.title}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Views', val: fmt(topPost.stats?.views) },
                    { label: 'ER',    val: topER ? topER.toFixed(1) + '%' : '—' },
                    { label: 'Saves', val: fmt(topPost.stats?.saves) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-tac-700/60 border border-tac-600 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-tac-200 mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-flo">{val}</p>
                    </div>
                  ))}
                </div>
                {topPost.pillar && (
                  <p className="text-xs text-tac-200">Pillar: {topPost.pillar} · <span className="text-flo">use this format again</span></p>
                )}
              </div>
            </div>
          )}

          {/* Habits */}
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-flo" />
              <span className="font-semibold text-stone-100 text-sm">Habits</span>
            </div>
            <div className="space-y-2">
              {[
                { text: 'Film in batches — 3–5 at once',           done: filming.length < 40 },
                { text: 'Log stats for every posted piece',         done: posted.filter(p => p.stats?.views).length === posted.length && posted.length > 0 },
                { text: 'Update follower counts once a month',      done: false },
                { text: 'Check Viral Watch for new format ideas',   done: false },
                { text: `${ready.length} post${ready.length !== 1 ? 's' : ''} ready — schedule them`, done: ready.length === 0 },
              ].map(({ text, done }) => (
                <div key={text} className="flex items-start gap-2">
                  <div className={`w-4 h-4 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                    done ? 'bg-flo border-flo' : 'border-tac-500'
                  }`}>
                    {done && <span className="text-tac-950 text-xs font-bold leading-none">✓</span>}
                  </div>
                  <p className={`text-xs leading-relaxed ${done ? 'text-tac-300 line-through' : 'text-tac-100'}`}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Coach */}
      <div className="mt-5">
        <ContentCoach posts={posts} />
      </div>

    </div>
  )
}
