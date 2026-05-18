import { useState, useMemo } from 'react'
import { Plus, RefreshCw, Columns, ScrollText, Search, X } from 'lucide-react'
import KanbanColumn from './KanbanColumn.jsx'
import ScriptView from './ScriptView.jsx'
import { usePosts } from '../../hooks/usePosts.js'

const ACTIVE_STATUSES = ['filming', 'editing', 'ready']
const PLATFORMS       = ['all', 'instagram', 'tiktok', 'youtube', 'facebook', 'multi']
const PLATFORM_LABELS = { all: 'All', instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', multi: 'Multi' }

const PILLARS = [
  'all', 'Personal Brand', 'Education', 'Fitness & Grind', 'Family',
  'Behind the Business', 'Engagement', 'Social Proof',
  'Conservation / Values', 'Seasonal', 'Product Demo', 'Bowmar', 'Hunting', 'Collab',
]

const BLANK_POST = { title: '', platform: 'instagram', type: 'reel', month: 1, status: 'filming' }

export default function ContentPipeline() {
  const { posts, loading, updateStatus, updatePost, addPost, deletePost, refresh } = usePosts()

  const [tab,         setTab]         = useState('board')
  const [scriptPostId, setScriptPostId] = useState(null)

  function openScript(postId) {
    setScriptPostId(postId)
    setTab('scripts')
  }
  const [month,    setMonth]    = useState(1)
  const [platform, setPlatform] = useState('all')
  const [pillar,   setPillar]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [newPost,  setNewPost]  = useState(BLANK_POST)

  const visible = useMemo(() => posts.filter(p =>
    ACTIVE_STATUSES.includes(p.status) &&
    p.month === month &&
    (platform === 'all' || p.platform === platform) &&
    (pillar   === 'all' || p.pillar   === pillar) &&
    (!search.trim() || p.title.toLowerCase().includes(search.toLowerCase()))
  ), [posts, month, platform, pillar, search])

  const byStatus = status => {
    const filtered = visible.filter(p => p.status === status)
    return [...filtered].sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
  }

  const monthPosts  = posts.filter(p => p.month === month)
  const postedCount = monthPosts.filter(p => p.status === 'posted').length
  const remaining   = monthPosts.filter(p => ACTIVE_STATUSES.includes(p.status)).length

  async function handleAdd(e) {
    e.preventDefault()
    if (!newPost.title.trim()) return
    await addPost({ ...newPost, month })
    setNewPost(BLANK_POST)
    setShowAdd(false)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Content Studio</h1>
          <p className="text-sm text-tac-200 mt-0.5">
            {monthPosts.length} posts · {postedCount} published · {remaining} in progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex bg-tac-800 border border-tac-700 rounded-lg p-1 gap-1">
            <button onClick={() => setTab('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                tab === 'board' ? 'bg-flo text-tac-950' : 'text-tac-300 hover:text-stone-100'
              }`}
            >
              <Columns size={13} /> Board
            </button>
            <button onClick={() => setTab('scripts')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                tab === 'scripts' ? 'bg-flo text-tac-950' : 'text-tac-300 hover:text-stone-100'
              }`}
            >
              <ScrollText size={13} /> Scripts
            </button>
          </div>
          <button onClick={refresh} className="p-2 rounded-lg text-tac-200 hover:bg-tac-700 hover:text-stone-100 border border-tac-700 transition-colors">
            <RefreshCw size={16} />
          </button>
          {tab === 'board' && (
            <button
              onClick={() => setShowAdd(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 bg-flo hover:bg-flo/90 text-tac-950 text-sm font-bold rounded-lg transition-colors"
            >
              <Plus size={15} /> Add Post
            </button>
          )}
        </div>
      </div>

      {/* Add post form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-5 p-4 bg-tac-800 border border-flo/25 rounded-xl flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs font-medium text-tac-200 block mb-1">Title *</label>
            <input autoFocus required value={newPost.title}
              onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
              placeholder="Post title…" className="input-tac w-full" />
          </div>
          <div>
            <label className="text-xs font-medium text-tac-200 block mb-1">Platform</label>
            <select value={newPost.platform} onChange={e => setNewPost(p => ({ ...p, platform: e.target.value }))}
              className="input-tac">
              {PLATFORMS.filter(p => p !== 'all').map(pl => <option key={pl} value={pl}>{PLATFORM_LABELS[pl]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-tac-200 block mb-1">Type</label>
            <select value={newPost.type} onChange={e => setNewPost(p => ({ ...p, type: e.target.value }))}
              className="input-tac">
              {['reel','short','video','post','story'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-tac-200 block mb-1">Month</label>
            <select value={newPost.month} onChange={e => setNewPost(p => ({ ...p, month: Number(e.target.value) }))}
              className="input-tac">
              <option value={1}>Month 1</option>
              <option value={2}>Month 2</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-flo text-sm">Save</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-tac text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Filters — board only */}
      <div className={`space-y-2.5 mb-5 ${tab === 'scripts' ? 'hidden' : ''}`}>
        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tac-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-7 pr-7 py-1.5 text-xs bg-tac-800 border border-tac-700 rounded-lg text-tac-100 placeholder-tac-500 outline-none focus:border-tac-500 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-tac-400 hover:text-tac-100 transition-colors">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month tabs */}
          <div className="flex bg-tac-800 border border-tac-700 rounded-lg p-1 gap-1">
            {[1, 2].map(m => (
              <button key={m} onClick={() => setMonth(m)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  month === m ? 'bg-flo text-tac-950 font-bold' : 'text-tac-200 hover:text-stone-100'
                }`}
              >
                Month {m}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  month === m ? 'bg-tac-950/20 text-tac-950' : 'bg-tac-700 text-tac-300'
                }`}>
                  {posts.filter(p => p.month === m && ACTIVE_STATUSES.includes(p.status)).length}
                </span>
              </button>
            ))}
          </div>
          {/* Platform filter */}
          <div className="flex flex-wrap gap-1">
            {PLATFORMS.map(pl => (
              <button key={pl} onClick={() => setPlatform(pl)}
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
        </div>
        {/* Pillar filter */}
        <div className="flex flex-wrap gap-1">
          {PILLARS.map(pl => (
            <button key={pl} onClick={() => setPillar(pl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                pillar === pl
                  ? 'bg-tan/10 border-tan/30 text-tan'
                  : 'bg-tac-800 border-tac-700 text-tac-300 hover:border-tac-500 hover:text-tac-100'
              }`}
            >
              {pl === 'all' ? 'All Pillars' : pl}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === 'scripts' ? (
        <ScriptView initialPostId={scriptPostId} />
      ) : loading ? (
        <div className="flex items-center justify-center h-64 text-tac-200">Loading posts…</div>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Filming — wide primary column */}
          <div className="flex-[3] min-w-0">
            <KanbanColumn status="filming" posts={byStatus('filming')}
              onStatusChange={updateStatus} onUpdate={updatePost} onDelete={deletePost} onOpenScript={openScript} />
          </div>
          {/* Editing + Ready stacked */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <KanbanColumn status="editing" posts={byStatus('editing')} compact
              onStatusChange={updateStatus} onUpdate={updatePost} onDelete={deletePost} onOpenScript={openScript} />
            <KanbanColumn status="ready" posts={byStatus('ready')} compact
              onStatusChange={updateStatus} onUpdate={updatePost} onDelete={deletePost} onOpenScript={openScript} />
          </div>
        </div>
      )}
    </div>
  )
}
