import { useState, useMemo } from 'react'
import { BarChart2, Eye, TrendingUp, Award } from 'lucide-react'
import PostedCard from './PostedCard.jsx'

const PLATFORM_FILTER = ['all', 'instagram', 'tiktok', 'youtube', 'facebook', 'multi']
const PLATFORM_LABELS = { all: 'All', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', multi: 'Multi' }
const SORT_OPTIONS    = ['newest', 'views', 'er']
const SORT_LABELS     = { newest: 'Newest', views: 'Most Views', er: 'Best ER' }

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

function StatSummaryCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5 flex items-start gap-4 hover:border-tac-500 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} className="text-tac-950" />
      </div>
      <div>
        <p className="text-xs font-medium text-tac-200 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-stone-100 leading-none">{value}</p>
        {sub && <p className="text-xs text-tac-300 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function PostedTab({ posts, onUpdateStats, onUpdatePost }) {
  const [platform, setPlatform] = useState('all')
  const [sort,     setSort]     = useState('newest')

  const posted = useMemo(() => posts.filter(p => p.status === 'posted'), [posts])

  const filtered = useMemo(() => {
    let arr = platform === 'all'
      ? posted
      : posted.filter(p => p.platform === platform)

    return [...arr].sort((a, b) => {
      if (sort === 'views') return (b.stats?.views ?? 0) - (a.stats?.views ?? 0)
      if (sort === 'er') {
        const erA = calcER(a.stats) ?? -1
        const erB = calcER(b.stats) ?? -1
        return erB - erA
      }
      return (b.posted_at ?? '').localeCompare(a.posted_at ?? '')
    })
  }, [posted, platform, sort])

  const totalViews  = filtered.reduce((s, p) => s + (p.stats?.views ?? 0), 0)
  const totalReach  = filtered.reduce((s, p) => s + (p.stats?.reach ?? 0), 0)
  const erValues    = filtered.map(p => calcER(p.stats)).filter(e => e !== null)
  const avgER       = erValues.length ? erValues.reduce((s, e) => s + e, 0) / erValues.length : null

  const topPost = filtered.reduce((best, p) => {
    if (!best) return p
    return (p.stats?.views ?? 0) > (best.stats?.views ?? 0) ? p : best
  }, null)

  return (
    <div>
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatSummaryCard icon={Award}     label="Posts Published" value={filtered.length}                            sub={platform === 'all' ? `${posts.length - posted.length} still in pipeline` : `${posted.length} total posted`} accent="bg-flo" />
        <StatSummaryCard icon={Eye}       label="Total Views"     value={fmt(totalViews)}                           sub="across all posted content"                             accent="bg-tan" />
        <StatSummaryCard icon={TrendingUp} label="Avg Engagement" value={avgER !== null ? avgER.toFixed(1) + '%' : '—'} sub="engagement rate"                                accent="bg-flo" />
        <StatSummaryCard icon={BarChart2} label="Total Reach"     value={fmt(totalReach)}                           sub="unique accounts reached"                               accent="bg-tan" />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        {/* Platform filter */}
        <div className="flex gap-1 flex-wrap">
          {PLATFORM_FILTER.map(pl => (
            <button
              key={pl}
              onClick={() => setPlatform(pl)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                platform === pl
                  ? 'bg-flo/10 border-flo/30 text-flo'
                  : 'bg-tac-800 border-tac-700 text-tac-200 hover:border-tac-500 hover:text-tac-100'
              }`}
            >
              {PLATFORM_LABELS[pl]}
            </button>
          ))}
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-1 bg-tac-800 border border-tac-700 rounded-lg p-1">
          {SORT_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sort === s
                  ? 'bg-flo text-tac-950 font-bold'
                  : 'text-tac-300 hover:text-stone-100'
              }`}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-tac-800 border border-tac-700 rounded-2xl flex items-center justify-center mb-4">
            <Award size={28} className="text-tac-400" />
          </div>
          <p className="text-tac-200 font-medium">Nothing posted yet</p>
          <p className="text-sm text-tac-400 mt-1">
            Move a card to Posted from the Active board to see it here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((post) => (
            <PostedCard
              key={post.id}
              post={post}
              isTop={post.id === topPost?.id && (post.stats?.views ?? 0) > 0}
              onUpdateStats={onUpdateStats}
              onUpdatePost={onUpdatePost}
            />
          ))}
        </div>
      )}
    </div>
  )
}
