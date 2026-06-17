import { useState, useCallback } from 'react'
import { Plus, Trash2, BookOpen, Mic } from 'lucide-react'
import { useBrandNotes } from '../../hooks/useBrandNotes.js'
import VoiceDictation from '../ideas/VoiceDictation.jsx'
import { formatDistanceToNow } from 'date-fns'

const CATEGORIES = [
  { value: 'working',  label: "What's Working",     color: 'bg-flo/10 text-flo border-flo/20' },
  { value: 'not_working', label: "Not Working",      color: 'bg-red-900/30 text-red-400 border-red-700/30' },
  { value: 'hook',     label: 'Hook Feedback',       color: 'bg-tan/10 text-tan border-tan/20' },
  { value: 'caption',  label: 'Caption Feedback',    color: 'bg-violet-900/30 text-violet-400 border-violet-700/30' },
  { value: 'filming',  label: 'Filming Notes',       color: 'bg-sky-900/30 text-sky-400 border-sky-700/30' },
  { value: 'general',  label: 'General',             color: 'bg-tac-700 text-tac-300 border-tac-600' },
]

function categoryStyle(val) {
  return CATEGORIES.find(c => c.value === val)?.color ?? 'bg-tac-700 text-tac-300 border-tac-600'
}
function categoryLabel(val) {
  return CATEGORIES.find(c => c.value === val)?.label ?? val
}

export default function BrandNotes() {
  const { notes, addNote, deleteNote } = useBrandNotes()
  const [text,     setText]     = useState('')
  const [category, setCategory] = useState('general')
  const [filter,   setFilter]   = useState('all')
  const [open,     setOpen]     = useState(true)

  const handleTranscript = useCallback((t) => {
    setText(prev => prev ? prev + ' ' + t : t)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addNote({ content: text.trim(), category })
    setText('')
  }

  const filtered = filter === 'all' ? notes : notes.filter(n => n.category === filter)

  return (
    <div className="bg-tac-800 border border-tac-700 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-5 py-3.5 border-b border-tac-700 hover:bg-tac-750 transition-colors"
      >
        <div className="w-7 h-7 rounded-lg bg-tan/10 border border-tan/20 flex items-center justify-center">
          <BookOpen size={13} className="text-tan" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-semibold text-stone-100">Brand Feedback Log</p>
          <p className="text-xs text-tac-300">Lessons learned · what works · critique — Coach reads all of this</p>
        </div>
        <span className="text-xs text-tac-400">{notes.length} notes</span>
        <span className="text-tac-400 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-5 space-y-4">
          {/* Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Drop a note, critique, or lesson learned… e.g. 'Hooks that start with a question perform 2x better' or 'Stop using the word journey'"
              rows={3}
              className="input-tac w-full resize-none text-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="input-tac text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <VoiceDictation onTranscript={handleTranscript} />
              <button
                type="submit"
                disabled={!text.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-flo hover:bg-flo/90 disabled:opacity-40 text-tac-950 text-sm font-bold rounded-xl transition-colors ml-auto"
              >
                <Plus size={14} /> Save Note
              </button>
            </div>
          </form>

          {/* Filter tabs */}
          {notes.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                  filter === 'all' ? 'bg-flo/10 border-flo/30 text-flo' : 'bg-tac-750 border-tac-600 text-tac-300 hover:border-tac-500'
                }`}
              >
                All ({notes.length})
              </button>
              {CATEGORIES.filter(c => notes.some(n => n.category === c.value)).map(c => (
                <button
                  key={c.value}
                  onClick={() => setFilter(c.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    filter === c.value ? 'bg-flo/10 border-flo/30 text-flo' : 'bg-tac-750 border-tac-600 text-tac-300 hover:border-tac-500'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Notes list */}
          {filtered.length === 0 ? (
            <p className="text-xs text-tac-500 text-center py-4">
              No notes yet — drop your first critique or lesson above
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
              {filtered.map(note => (
                <div key={note.id} className="flex items-start gap-3 p-3 bg-tac-750 border border-tac-700 rounded-xl hover:border-tac-500 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide ${categoryStyle(note.category)}`}>
                        {categoryLabel(note.category)}
                      </span>
                      <span className="text-[10px] text-tac-500">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-tac-100 leading-relaxed">{note.content}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="shrink-0 p-1 text-tac-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
