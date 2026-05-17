import { useState, useCallback } from 'react'
import { Plus, Search, Trash2, Tag, RefreshCw, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import VoiceDictation from './VoiceDictation.jsx'
import PolishModal from './PolishModal.jsx'
import { useIdeas } from '../../hooks/useIdeas.js'
import { usePosts } from '../../hooks/usePosts.js'
import { formatDistanceToNow, format } from 'date-fns'

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook', 'multi']
const STATUSES  = ['raw', 'refined', 'used']

const STATUS_STYLES = {
  raw:     'bg-tan/10 text-tan',
  refined: 'bg-blue-900/30 text-blue-400',
  used:    'bg-flo/10 text-flo',
}

const PLATFORM_STYLES = {
  instagram: 'bg-pink-950/50 text-pink-300',
  tiktok:    'bg-cyan-950/50 text-cyan-300',
  youtube:   'bg-red-950/50 text-red-300',
  facebook:  'bg-blue-950/50 text-blue-300',
  multi:     'bg-tac-700 text-tac-100',
}

export default function IdeaLog() {
  const { ideas, loading, addIdea, updateIdea, deleteIdea, refresh } = useIdeas()
  const { addPost } = usePosts()

  const [text,         setText]       = useState('')
  const [platform,     setPlatform]   = useState('')
  const [tagInput,     setTagInput]   = useState('')
  const [tags,         setTags]       = useState([])
  const [search,       setSearch]     = useState('')
  const [filterStatus, setFilter]     = useState('all')
  const [polishIdea,   setPolishIdea] = useState(null)

  const handleTranscript = useCallback((t) => {
    setText(prev => prev ? prev + ' ' + t : t)
  }, [])

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addIdea({ title: text.slice(0, 80), content: text, platform: platform || null, tags, status: 'raw' })
    setText('')
    setPlatform('')
    setTags([])
  }

  const filtered = ideas
    .filter(i => filterStatus === 'all' || i.status === filterStatus)
    .filter(i => !search || [i.title, i.content, ...(i.tags ?? [])].join(' ').toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Idea Log</h1>
          <p className="text-sm text-tac-200 mt-0.5">{ideas.length} ideas captured</p>
        </div>
        <button onClick={refresh} className="p-2 rounded-lg text-tac-200 hover:bg-tac-700 border border-tac-700 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Input card */}
      <form onSubmit={handleSubmit} className="bg-tac-800 border border-flo/20 rounded-2xl p-5 mb-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-tac-200 mb-1.5 block">Idea</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or dictate your content idea…"
            rows={3}
            className="input-tac w-full resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <VoiceDictation onTranscript={handleTranscript} />

          <select
            value={platform}
            onChange={e => setPlatform(e.target.value)}
            className="input-tac text-sm"
          >
            <option value="">Platform (any)</option>
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* Tags */}
          <div className="flex items-center gap-1">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
              placeholder="#tag"
              className="input-tac w-24 text-sm"
            />
            <button type="button" onClick={addTag}
              className="p-2 rounded-lg bg-tac-700 border border-tac-600 hover:bg-tac-600 text-tac-200 transition-colors">
              <Tag size={14} />
            </button>
          </div>

          {tags.map(t => (
            <span key={t} className="flex items-center gap-1 bg-flo/10 text-flo text-xs px-2 py-1 rounded-full border border-flo/20">
              #{t}
              <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-red-400 transition-colors">×</button>
            </span>
          ))}
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-flo hover:bg-flo/90 disabled:opacity-40 text-tac-950 text-sm font-bold rounded-xl transition-colors"
        >
          <Plus size={15} /> Save Idea
        </button>
      </form>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tac-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ideas…"
            className="input-tac w-full pl-8"
          />
        </div>
        <div className="flex gap-1">
          {['all', ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                filterStatus === s
                  ? 'bg-flo/10 border-flo/30 text-flo'
                  : 'bg-tac-800 border-tac-700 text-tac-200 hover:border-tac-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas list */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-tac-300">Loading ideas…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-tac-400">
          <p className="text-lg mb-1">No ideas yet</p>
          <p className="text-sm">Type or dictate one above to start your log</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(idea => {
            const inPipeline = idea.status === 'used'
            const createdAt  = new Date(idea.created_at)
            return (
              <div key={idea.id} className={`border rounded-2xl p-4 transition-colors ${
                inPipeline
                  ? 'bg-flo/5 border-flo/20 hover:border-flo/35'
                  : 'bg-tac-800 border-tac-700 hover:border-tac-500'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Date row */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-tac-400">
                        {format(createdAt, 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs text-tac-600">·</span>
                      <span className="text-xs text-tac-500">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </span>
                      {inPipeline && (
                        <span className="flex items-center gap-1 ml-auto text-xs font-semibold text-flo bg-flo/10 border border-flo/25 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> In Pipeline
                        </span>
                      )}
                    </div>

                    <p className={`text-sm font-medium mb-2 ${inPipeline ? 'text-tac-200' : 'text-stone-100'}`}>
                      {idea.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {!inPipeline && (
                        <select
                          value={idea.status}
                          onChange={e => updateIdea(idea.id, { status: e.target.value })}
                          className={`text-xs px-2 py-0.5 rounded-full border-0 font-medium cursor-pointer bg-transparent ${STATUS_STYLES[idea.status]}`}
                        >
                          {STATUSES.map(s => <option key={s} value={s} className="bg-tac-800 text-stone-100">{s}</option>)}
                        </select>
                      )}
                      {idea.platform && (
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${PLATFORM_STYLES[idea.platform] ?? 'bg-tac-700 text-tac-100'}`}>
                          {idea.platform}
                        </span>
                      )}
                      {(idea.tags ?? []).map(t => (
                        <span key={t} className="text-xs text-tac-400">#{t}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!inPipeline && (
                      <button
                        onClick={() => setPolishIdea(idea)}
                        title="Polish with AI → add to Pipeline"
                        className="p-1.5 rounded-lg text-tac-400 hover:bg-flo/10 hover:text-flo transition-colors"
                      >
                        <Sparkles size={14} />
                      </button>
                    )}
                    {!inPipeline && (
                      <button
                        onClick={() => updateIdea(idea.id, { status: idea.status === 'raw' ? 'refined' : 'used' })}
                        title="Advance status"
                        className="p-1.5 rounded-lg text-tac-400 hover:bg-tac-700 hover:text-flo transition-colors"
                      >
                        <ArrowRight size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="p-1.5 rounded-lg text-tac-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {polishIdea && (
        <PolishModal
          idea={polishIdea}
          onClose={() => setPolishIdea(null)}
          onAddToPipeline={async (post) => {
            await addPost(post)
            await updateIdea(polishIdea.id, { status: 'used' })
          }}
        />
      )}
    </div>
  )
}
