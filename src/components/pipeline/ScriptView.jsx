import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Copy, Check, Trash2, FileText, ScrollText, Star } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { usePosts } from '../../hooks/usePosts.js'
import { generateScript } from '../../lib/generateScript.js'

const STATUS_DOT = {
  filming: 'bg-tan',
  editing: 'bg-blue-400',
  ready:   'bg-flo',
  posted:  'bg-tac-500',
}

function renderScript(text) {
  try {
    return String(text).split('\n').map((line, i) => {
      if (/^\*\*\[.+\]\*\*/.test(line)) {
        const label = line.replace(/\*\*/g, '')
        return <p key={i} className="text-xs font-bold text-flo uppercase tracking-widest mt-5 mb-2 first:mt-0">{label}</p>
      }
      if (!line || line.trim() === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-lg leading-relaxed text-stone-100">{line}</p>
    })
  } catch {
    return <p className="text-xs text-red-400">Error rendering script. Try regenerating.</p>
  }
}

export default function ScriptView({ initialPostId }) {
  const { posts, updatePost } = usePosts()

  const [selectedId,  setSelectedId]  = useState(initialPostId ?? null)
  const [viewingId,   setViewingId]   = useState(null)
  const [roughNotes,  setRoughNotes]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [error,       setError]       = useState(null)
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    if (initialPostId) setSelectedId(initialPostId)
  }, [initialPostId])

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month
    return (a.position ?? 999) - (b.position ?? 999)
  })

  const filtered = sortedPosts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  const selected = posts.find(p => p.id === selectedId)

  // Normalise: posts may have old single `script` string — migrate to array on read
  const scripts = selected
    ? (selected.scripts?.length
        ? selected.scripts
        : selected.script
          ? [{ id: 'v0', text: selected.script, createdAt: null }]
          : [])
    : []

  const viewing = scripts.find(s => s.id === viewingId) ?? scripts[scripts.length - 1] ?? null

  // When switching posts, auto-select the latest script version
  useEffect(() => {
    if (scripts.length > 0) setViewingId(scripts[scripts.length - 1].id)
    else setViewingId(null)
    setRoughNotes('')
    setError(null)
  }, [selectedId]) // eslint-disable-line

  function selectPost(post) {
    setSelectedId(post.id)
  }

  async function handleGenerate() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const result = await generateScript({ post: selected, roughNotes })
      const newVersion = { id: crypto.randomUUID(), text: result, createdAt: new Date().toISOString() }
      const newScripts = [...(selected.scripts ?? (selected.script ? [{ id: 'v0', text: selected.script, createdAt: null }] : [])), newVersion]
      await updatePost(selected.id, { scripts: newScripts, script: result })
      setViewingId(newVersion.id)
    } catch (e) {
      setError(e.message === 'NO_KEY' ? 'Add your API key to .env.local' : e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!viewing) return
    await navigator.clipboard.writeText(viewing.text.replace(/\*\*/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function setActive(scriptId) {
    const s = scripts.find(v => v.id === scriptId)
    if (s) updatePost(selected.id, { script: s.text })
  }

  function deleteVersion(scriptId) {
    const newScripts = scripts.filter(s => s.id !== scriptId)
    const activeTxt = selected.script
    const stillActive = newScripts.some(s => s.text === activeTxt)
    const newActive = stillActive ? activeTxt : (newScripts[newScripts.length - 1]?.text ?? '')
    updatePost(selected.id, { scripts: newScripts, script: newActive })
    if (viewingId === scriptId) {
      setViewingId(newScripts[newScripts.length - 1]?.id ?? null)
    }
  }

  const isActive = (s) => s.text === selected?.script

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
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filtered.map(post => {
            const versionCount = post.scripts?.length ?? (post.script ? 1 : 0)
            return (
              <button
                key={post.id}
                onClick={() => selectPost(post)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all ${
                  selectedId === post.id
                    ? 'bg-flo/10 border-flo/30 text-stone-100'
                    : 'bg-tac-800 border-tac-700 text-tac-200 hover:border-tac-500 hover:text-tac-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[post.status] ?? 'bg-tac-500'}`} />
                  <span className="text-xs text-tac-400 capitalize">{post.status}</span>
                  {versionCount > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-flo/70">
                      <ScrollText size={9} />
                      {versionCount > 1 ? `${versionCount}` : ''}
                    </span>
                  )}
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

      {/* Script editor */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <FileText size={36} className="text-tac-600" />
            <p className="text-tac-400 text-sm">Select a post to generate its teleprompter script</p>
          </div>
        ) : (
          <>
            {/* Post header */}
            <div className="bg-tac-800 border border-tac-700 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[selected.status] ?? 'bg-tac-500'}`} />
                <span className="text-xs text-tac-400 capitalize">{selected.status} · {selected.platform} · {selected.type}</span>
              </div>
              <p className="text-sm font-semibold text-stone-100">{selected.title}</p>
              {selected.hook && (
                <p className="text-xs text-tan italic mt-1 truncate">Hook: "{selected.hook}"</p>
              )}
            </div>

            {/* Rough notes + generate */}
            <div className="bg-tac-800 border border-tac-700 rounded-xl p-4">
              <label className="text-xs font-semibold text-tac-300 uppercase tracking-wide block mb-2">
                Rough notes / talking points
              </label>
              <textarea
                value={roughNotes}
                onChange={e => setRoughNotes(e.target.value)}
                placeholder="Dump your thoughts here — key points, stories to tell, things to show, whatever's in your head. Claude will shape it into a script."
                rows={3}
                className="input-tac w-full resize-none text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-tac-500">Each generation is saved as a new version</p>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-flo hover:bg-flo/90 disabled:opacity-50 text-tac-950 text-sm font-bold rounded-xl transition-colors"
                >
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                    : <><Sparkles size={14} /> {scripts.length > 0 ? 'Generate Another' : 'Generate Script'}</>
                  }
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            </div>

            {/* Version list + viewer */}
            {scripts.length > 0 && (
              <div className="flex-1 flex flex-col min-h-0 bg-tac-800 border border-tac-700 rounded-xl overflow-hidden">

                {/* Version tabs */}
                <div className="flex items-center gap-0 border-b border-tac-700 overflow-x-auto scrollbar-thin">
                  {scripts.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setViewingId(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-r border-tac-700 transition-colors shrink-0 ${
                        viewingId === s.id
                          ? 'bg-tac-700 text-stone-100'
                          : 'text-tac-400 hover:text-tac-100 hover:bg-tac-750'
                      }`}
                    >
                      {isActive(s) && <Star size={9} className="text-flo fill-flo" />}
                      <span>v{i + 1}</span>
                      {s.createdAt && (
                        <span className="text-tac-500 font-normal">
                          · {formatDistanceToNow(parseISO(s.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </button>
                  ))}
                  <div className="flex-1" />
                  {/* Actions for viewed version */}
                  {viewing && (
                    <div className="flex items-center gap-1 px-2 shrink-0">
                      {!isActive(viewing) && (
                        <button
                          onClick={() => setActive(viewing.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-tac-300 hover:text-flo border border-tac-600 hover:border-flo/30 transition-colors"
                          title="Use this version in PostCard preview"
                        >
                          <Star size={10} /> Use this
                        </button>
                      )}
                      {isActive(viewing) && (
                        <span className="flex items-center gap-1 text-xs text-flo/70 font-medium px-2">
                          <Star size={10} className="fill-flo" /> Active
                        </span>
                      )}
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          copied
                            ? 'bg-flo/20 text-flo border-flo/30'
                            : 'bg-tac-700 border-tac-600 text-tac-100 hover:bg-tac-600'
                        }`}
                      >
                        {copied ? <><Check size={10} /> Copied!</> : <><Copy size={10} /> Copy</>}
                      </button>
                      {scripts.length > 1 && (
                        <button
                          onClick={() => deleteVersion(viewing.id)}
                          className="p-1.5 text-tac-500 hover:text-red-400 transition-colors"
                          title="Delete this version"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Script body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {viewing ? renderScript(viewing.text) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
