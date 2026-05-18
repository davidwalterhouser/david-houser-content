import { useState } from 'react'
import { X, Sparkles, Zap, Film, Megaphone, Target, Globe, Plus, AlertCircle, Loader2 } from 'lucide-react'
import { polishIdea } from '../../lib/polishIdea.js'

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

const EFFORT_STYLES = {
  Low:    'bg-flo/10 text-flo border-flo/20',
  Medium: 'bg-tan/10 text-tan border-tan/20',
  High:   'bg-red-900/40 text-red-400 border-red-700/30',
}

const PILLARS = [
  'Personal Brand', 'Education', 'Fitness & Grind', 'Family',
  'Behind the Business', 'Engagement', 'Social Proof',
  'Conservation / Values', 'Seasonal', 'Product Demo', 'Bowmar', 'Hunting', 'Collab',
]

function Field({ label, icon: Icon, color, children }) {
  return (
    <div className={`rounded-xl p-3 ${color}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {Icon && <Icon size={11} className="shrink-0" />}
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      {children}
    </div>
  )
}

export default function PolishModal({ idea, onClose, onAddToPipeline }) {
  const [status,  setStatus]  = useState('idle') // idle | loading | done | error
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [month,   setMonth]   = useState(1)

  // editable fields
  const [draft, setDraft] = useState(null)

  async function generate() {
    setStatus('loading')
    setError('')
    try {
      const r = await polishIdea(idea.content)
      setResult(r)
      setDraft(r)
      setStatus('done')
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  function update(field, value) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  function handleAdd() {
    onAddToPipeline({
      title:          draft.title,
      pillar:         draft.pillar,
      platform:       draft.platform,
      platforms:      draft.platforms,
      effort:         draft.effort,
      type:           draft.type ?? 'reel',
      hook:           draft.hook,
      what:           draft.what,
      caption_starter: draft.caption_starter,
      viral_note:     draft.viral_note,
      platform_note:  draft.platform_note,
      month,
      status:         'filming',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-tac-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-tac-800 border border-tac-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-tac-700 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-flo/10 border border-flo/20 flex items-center justify-center">
            <Sparkles size={15} className="text-flo" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-100">Polish Idea</p>
            <p className="text-xs text-tac-300 truncate">{idea.content}</p>
          </div>
          <button onClick={onClose} className="p-1 text-tac-400 hover:text-tac-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">

          {status === 'idle' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-flo/10 border border-flo/20 flex items-center justify-center mb-4">
                <Sparkles size={28} className="text-flo" />
              </div>
              <p className="text-stone-100 font-semibold mb-1">Ready to develop this idea</p>
              <p className="text-sm text-tac-300 mb-6 max-w-sm">
                Claude will write a full hook, filming plan, caption starter, viral analysis, and platform strategy — tailored to your brand.
              </p>
              <button onClick={generate} className="btn-flo px-6 py-2.5 flex items-center gap-2">
                <Sparkles size={15} /> Generate post
              </button>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 size={32} className="text-flo animate-spin mb-4" />
              <p className="text-stone-100 font-semibold">Developing your idea…</p>
              <p className="text-sm text-tac-300 mt-1">Writing hook, filming plan, caption & strategy</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-700/30 flex items-center justify-center mb-4">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              {error === 'NO_KEY' ? (
                <>
                  <p className="text-stone-100 font-semibold mb-1">API key not set</p>
                  <p className="text-sm text-tac-300 mb-1">Open <code className="text-flo">.env.local</code> in the project root and add:</p>
                  <code className="text-xs bg-tac-700 text-flo px-3 py-1.5 rounded-lg mt-1 mb-4">VITE_ANTHROPIC_API_KEY=sk-ant-...</code>
                  <p className="text-xs text-tac-400">Get a key at console.anthropic.com, then restart the dev server.</p>
                </>
              ) : (
                <>
                  <p className="text-stone-100 font-semibold mb-2">Something went wrong</p>
                  <p className="text-sm text-red-400 mb-4">{error}</p>
                  <button onClick={generate} className="btn-tac text-sm">Try again</button>
                </>
              )}
            </div>
          )}

          {status === 'done' && draft && (
            <div className="space-y-3">

              {/* Title */}
              <div>
                <label className="text-xs font-medium text-tac-300 block mb-1">Title</label>
                <input
                  value={draft.title}
                  onChange={e => update('title', e.target.value)}
                  className="input-tac w-full text-sm font-semibold"
                />
              </div>

              {/* Meta row */}
              <div className="flex gap-2 flex-wrap">
                <select value={draft.pillar} onChange={e => update('pillar', e.target.value)} className="input-tac text-xs">
                  {PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select value={draft.effort} onChange={e => update('effort', e.target.value)} className="input-tac text-xs">
                  {['Low','Medium','High'].map(e => <option key={e} value={e}>{e} effort</option>)}
                </select>
                <select value={draft.type ?? 'reel'} onChange={e => update('type', e.target.value)} className="input-tac text-xs">
                  {['reel','short','video','post','story'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Platform chips */}
              {draft.platforms?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {draft.platforms.map(p => (
                    <span key={p} className={`text-xs px-2 py-0.5 rounded-full font-medium border ${DEST_STYLES[p] ?? 'bg-tac-700 text-tac-100 border-tac-600'}`}>
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Hook */}
              <Field label="Hook — first 3 sec" icon={Zap} color="bg-tan/5 border border-tan/15 text-tan">
                <textarea value={draft.hook} onChange={e => update('hook', e.target.value)}
                  rows={2} className="w-full text-xs text-tac-100 italic bg-transparent outline-none resize-none leading-relaxed" />
              </Field>

              {/* What to film */}
              <Field label="What to film" icon={Film} color="bg-tac-700/50 text-tac-200">
                <textarea value={draft.what} onChange={e => update('what', e.target.value)}
                  rows={3} className="w-full text-xs text-tac-100 bg-transparent outline-none resize-none leading-relaxed" />
              </Field>

              {/* Caption starter */}
              <Field label="Caption starter" icon={Megaphone} color="bg-flo/5 border border-flo/15 text-flo">
                <textarea value={draft.caption_starter} onChange={e => update('caption_starter', e.target.value)}
                  rows={2} className="w-full text-xs text-tac-100 italic bg-transparent outline-none resize-none leading-relaxed" />
              </Field>

              {/* Viral note */}
              {draft.viral_note && (
                <Field label="Viral note" icon={Target} color="bg-red-950/30 border border-red-800/20 text-red-400">
                  <textarea value={draft.viral_note} onChange={e => update('viral_note', e.target.value)}
                    rows={2} className="w-full text-xs text-tac-100 bg-transparent outline-none resize-none leading-relaxed" />
                </Field>
              )}

              {/* Platform note */}
              {draft.platform_note && (
                <Field label="Platform strategy" icon={Globe} color="bg-blue-950/30 border border-blue-800/20 text-blue-400">
                  <textarea value={draft.platform_note} onChange={e => update('platform_note', e.target.value)}
                    rows={2} className="w-full text-xs text-tac-100 bg-transparent outline-none resize-none leading-relaxed" />
                </Field>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {status === 'done' && (
          <div className="px-5 py-4 border-t border-tac-700 flex items-center gap-3 shrink-0">
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-tac text-xs">
              <option value={1}>Month 1</option>
              <option value={2}>Month 2</option>
            </select>
            <button onClick={handleAdd}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-flo hover:bg-flo/90 text-tac-950 text-sm font-bold rounded-xl transition-colors">
              <Plus size={15} /> Add to Content Studio
            </button>
            <button onClick={generate} className="btn-tac text-xs px-3 py-2.5">
              Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
