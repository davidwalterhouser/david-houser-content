import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Zap, Target, Megaphone, Film, CheckCircle2, Sparkles, Loader2, RotateCcw, ScrollText, Copy, Check } from 'lucide-react'
import { refineField } from '../../lib/refineField.js'

const EFFORT_STYLES = {
  Low:    'bg-flo/10 text-flo',
  Medium: 'bg-tan/10 text-tan',
  High:   'bg-red-900/40 text-red-400',
}

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

const STATUS_OPTIONS = ['filming', 'editing', 'ready', 'posted']

const STATUS_SELECT_STYLES = {
  filming: 'text-tan    border-tan/40    bg-tan/10',
  editing: 'text-blue-400 border-blue-700/40 bg-blue-900/20',
  ready:   'text-flo    border-flo/40    bg-flo/10',
  posted:  'text-tac-300 border-tac-600  bg-tac-700',
}

function RefineBtn({ field, refining, onOpen }) {
  if (refining?.field === field) return null
  return (
    <button onClick={() => onOpen(field)} className="p-0.5 text-tac-500 hover:text-flo transition-colors ml-auto">
      <Sparkles size={10} />
    </button>
  )
}

function RefineInput({ field, refining, loading, setRefining, onSubmit }) {
  if (refining?.field !== field) return null
  return (
    <div className="mt-2 flex gap-1.5">
      <input
        autoFocus
        value={refining.feedback}
        onChange={e => setRefining(r => ({ ...r, feedback: e.target.value }))}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder="Your feedback… e.g. make it shorter, more aggressive"
        className="input-tac flex-1 text-xs py-1"
        disabled={loading}
      />
      {loading
        ? <Loader2 size={14} className="text-flo animate-spin shrink-0 mt-1.5" />
        : <>
            <button onClick={onSubmit} className="px-2 py-1 bg-flo text-tac-950 text-xs font-bold rounded-lg">→</button>
            <button onClick={() => setRefining(null)} className="p-1 text-tac-400 hover:text-tac-100 transition-colors">
              <RotateCcw size={11} />
            </button>
          </>
      }
    </div>
  )
}

export default function PostCard({ post, onStatusChange, onUpdate, onDelete, onOpenScript }) {
  const [expanded,     setExpanded]     = useState(false)
  const [editing,      setEditing]      = useState(false)
  const [title,        setTitle]        = useState(post.title)
  const [refining,     setRefining]     = useState(null)  // { field, feedback }
  const [refineLoading, setRefineLoading] = useState(false)
  const [scriptOpen,   setScriptOpen]   = useState(false)
  const [copied,       setCopied]       = useState(false)

  async function copyScript() {
    const text = (post.script ?? '').replace(/\*\*/g, '')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function saveTitle() {
    if (title.trim()) onUpdate(post.id, { title: title.trim() })
    setEditing(false)
  }

  function openRefine(field) {
    setRefining({ field, feedback: '' })
  }

  async function submitRefine() {
    if (!refining?.feedback?.trim()) return
    setRefineLoading(true)
    try {
      const newVal = await refineField({
        post,
        field: refining.field,
        currentValue: post[refining.field] ?? '',
        feedback: refining.feedback,
      })
      onUpdate(post.id, { [refining.field]: newVal })
      setRefining(null)
    } catch (e) {
      alert(e.message === 'NO_KEY' ? 'Add your API key to .env.local' : e.message)
    } finally {
      setRefineLoading(false)
    }
  }

  return (
    <div className={`bg-tac-750 rounded-xl border transition-all ${
      expanded ? 'border-flo/25' : 'border-tac-700 hover:border-tac-500'
    }`}>
      {/* Header */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Left: position + type */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {post.position != null && (
              <span className="text-xs font-bold text-flo bg-flo/10 border border-flo/20 w-6 h-6 rounded-md flex items-center justify-center shrink-0 leading-none">
                {post.position}
              </span>
            )}
            <span className="text-xs text-tac-300 uppercase tracking-wide">{post.type}</span>
          </div>
          {/* Right: effort badge + status dropdown stacked */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            {post.effort && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EFFORT_STYLES[post.effort] ?? 'bg-tac-600 text-tac-100'}`}>
                {post.effort}
              </span>
            )}
            <select
              value={post.status}
              onChange={e => onStatusChange(post.id, e.target.value)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-lg border cursor-pointer outline-none capitalize ${STATUS_SELECT_STYLES[post.status] ?? STATUS_SELECT_STYLES.filming}`}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s} className="bg-tac-800 text-stone-100">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => e.key === 'Enter' && saveTitle()}
            className="w-full text-sm font-medium text-stone-100 border-b border-flo/50 outline-none pb-0.5 bg-transparent"
          />
        ) : (
          <p
            className="text-sm font-medium text-stone-100 leading-snug cursor-pointer hover:text-flo line-clamp-2 transition-colors"
            onDoubleClick={() => setEditing(true)}
            title="Double-click to edit"
          >
            {post.title}
          </p>
        )}

        {post.pillar && (
          <p className="text-xs text-tac-300 mt-1 truncate">{post.pillar}</p>
        )}
      </div>

      {/* Destination pills */}
      {post.platforms?.length > 0 && (
        <div className="flex gap-1 flex-wrap px-3 pb-3">
          {post.platforms.map(pl => (
            <span key={pl} className={`text-xs px-2 py-0.5 rounded-full font-medium ${DEST_STYLES[pl] ?? 'bg-tac-700 text-tac-100'}`}>
              {pl}
            </span>
          ))}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-tac-400 hover:text-flo border-t border-tac-700 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {expanded ? 'Hide details' : 'Details'}
          {!expanded && post.script && <ScrollText size={10} className="text-flo/50" />}
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-tac-700">

          {post.hook && (
            <div className="mt-3 bg-tan/5 border-l-2 border-tan rounded-r-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={11} className="text-tan" />
                <p className="text-xs font-semibold text-tan uppercase tracking-wide flex-1">Hook — first 3 sec</p>
                <RefineBtn field="hook" refining={refining} onOpen={openRefine} />
              </div>
              <p className="text-xs text-tac-100 italic leading-relaxed">"{post.hook}"</p>
              <RefineInput field="hook" refining={refining} loading={refineLoading} setRefining={setRefining} onSubmit={submitRefine} />
            </div>
          )}

          {post.what && (
            <div className="bg-tac-700/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Film size={11} className="text-tac-200" />
                <p className="text-xs font-semibold text-tac-100 uppercase tracking-wide flex-1">What to film</p>
                <RefineBtn field="what" refining={refining} onOpen={openRefine} />
              </div>
              <p className="text-xs text-tac-100 leading-relaxed">{post.what}</p>
              <RefineInput field="what" refining={refining} loading={refineLoading} setRefining={setRefining} onSubmit={submitRefine} />
            </div>
          )}

          {post.caption_starter && post.caption_starter !== 'N/A — Stories format' && (
            <div className="bg-flo/5 border border-flo/15 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Megaphone size={11} className="text-flo" />
                <p className="text-xs font-semibold text-flo uppercase tracking-wide flex-1">Caption starter</p>
                <RefineBtn field="caption_starter" refining={refining} onOpen={openRefine} />
              </div>
              <p className="text-xs text-tac-100 italic leading-relaxed">"{post.caption_starter}"</p>
              <RefineInput field="caption_starter" refining={refining} loading={refineLoading} setRefining={setRefining} onSubmit={submitRefine} />
            </div>
          )}

          {post.viral_note && (
            <div className="bg-red-950/30 border-l-2 border-red-500 rounded-r-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target size={11} className="text-red-400" />
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wide flex-1">Viral note</p>
                <RefineBtn field="viral_note" refining={refining} onOpen={openRefine} />
              </div>
              <p className="text-xs text-tac-100 leading-relaxed">{post.viral_note}</p>
              <RefineInput field="viral_note" refining={refining} loading={refineLoading} setRefining={setRefining} onSubmit={submitRefine} />
            </div>
          )}

          {post.platform_note && (
            <div className="bg-blue-950/30 border-l-2 border-blue-500 rounded-r-lg p-3">
              <div className="flex items-center gap-1.5 mb-1 justify-between">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Platform strategy</p>
                <RefineBtn field="platform_note" refining={refining} onOpen={openRefine} />
              </div>
              <p className="text-xs text-tac-100 leading-relaxed">{post.platform_note}</p>
              <RefineInput field="platform_note" refining={refining} loading={refineLoading} setRefining={setRefining} onSubmit={submitRefine} />
            </div>
          )}

          <div className="bg-tac-700/40 border border-tac-600/50 rounded-lg overflow-hidden">
            {/* Script header row */}
            <div className="flex items-center gap-1.5 px-3 py-2.5">
              <ScrollText size={11} className="text-flo/70" />
              <p className="text-xs font-semibold text-flo/80 uppercase tracking-wide flex-1">Script</p>
              {post.script ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyScript}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold border transition-all ${
                      copied
                        ? 'bg-flo/20 text-flo border-flo/30'
                        : 'bg-tac-600/50 border-tac-500/50 text-tac-200 hover:text-flo hover:border-flo/30'
                    }`}
                  >
                    {copied ? <><Check size={9} /> Copied!</> : <><Copy size={9} /> Copy</>}
                  </button>
                  <button
                    onClick={() => setScriptOpen(v => !v)}
                    className="flex items-center gap-0.5 text-xs text-tac-400 hover:text-tac-100 transition-colors px-1"
                  >
                    {scriptOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              ) : onOpenScript && (
                <button
                  onClick={() => onOpenScript(post.id)}
                  className="text-xs text-flo/70 hover:text-flo transition-colors underline underline-offset-2"
                >
                  Generate →
                </button>
              )}
            </div>

            {/* Script body */}
            {post.script ? (
              <div
                className={`px-3 pb-3 border-t border-tac-600/40 pt-2.5 transition-all ${
                  scriptOpen ? '' : 'cursor-pointer'
                }`}
                onClick={!scriptOpen ? () => setScriptOpen(true) : undefined}
              >
                <p className={`text-xs text-tac-200 leading-relaxed whitespace-pre-line ${scriptOpen ? '' : 'line-clamp-3'}`}>
                  {post.script.replace(/\*\*\[(.+)\]\*\*/g, '[$1]')}
                </p>
                {scriptOpen && onOpenScript && (
                  <button
                    onClick={() => onOpenScript(post.id)}
                    className="mt-2 text-xs text-flo/60 hover:text-flo transition-colors underline underline-offset-2"
                  >
                    Edit in Scripts →
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-tac-500 italic px-3 pb-2.5">No script yet</p>
            )}
          </div>

          {/* Mark as Posted CTA on Ready cards */}
          {post.status === 'ready' && (
            <button
              onClick={() => onStatusChange(post.id, 'posted')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-flo hover:bg-flo/90 text-tac-950 text-sm font-bold rounded-xl transition-colors"
            >
              <CheckCircle2 size={15} /> Mark as Posted
            </button>
          )}

          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1 text-xs text-red-500/60 hover:text-red-400 mt-1 transition-colors"
          >
            <Trash2 size={11} /> Delete post
          </button>
        </div>
      )}
    </div>
  )
}
