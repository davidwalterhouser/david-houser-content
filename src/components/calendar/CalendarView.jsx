import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Trash2, Save, CalendarDays } from 'lucide-react'
import { usePosts } from '../../hooks/usePosts.js'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addDays, parseISO, isToday, addMonths, subMonths,
} from 'date-fns'

const CHIP_COLORS = {
  instagram: 'bg-pink-950/70 border-pink-800/50 text-pink-300',
  tiktok:    'bg-cyan-950/70 border-cyan-800/50 text-cyan-300',
  youtube:   'bg-red-950/70 border-red-800/50 text-red-300',
  facebook:  'bg-blue-950/70 border-blue-800/50 text-blue-300',
  multi:     'bg-tac-700 border-tac-600 text-tac-100',
}

const EFFORT_COLORS = {
  Low:    'bg-flo/10 text-flo',
  Medium: 'bg-tan/10 text-tan',
  High:   'bg-red-900/40 text-red-400',
}

function buildSchedule(posts, startDateStr) {
  const start = parseISO(startDateStr)
  const m1 = posts.filter(p => p.month === 1).sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
  const m2 = posts.filter(p => p.month === 2).sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
  const map = {}
  m1.forEach((p, i) => {
    const day = m1.length > 1 ? Math.round(i * 29 / (m1.length - 1)) : 0
    map[p.id] = format(addDays(start, day), 'yyyy-MM-dd')
  })
  m2.forEach((p, i) => {
    const day = 30 + (m2.length > 1 ? Math.round(i * 29 / (m2.length - 1)) : 0)
    map[p.id] = format(addDays(start, day), 'yyyy-MM-dd')
  })
  return map
}

export default function CalendarView() {
  const { posts, updatePost, deletePost } = usePosts()

  const [startDate, setStartDate] = useState(() =>
    localStorage.getItem('plan_start') || format(new Date(), 'yyyy-MM-dd')
  )
  const [overrides, setOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sched_overrides') || '{}') } catch { return {} }
  })
  const [crossed, setCrossed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cal_crossed') || '[]')) } catch { return new Set() }
  })
  const [displayMonth, setDisplayMonth] = useState(new Date())
  const [editPost,     setEditPost]     = useState(null)
  const [editTitle,    setEditTitle]    = useState('')
  const [draggingId,   setDraggingId]   = useState(null)
  const [dragOver,     setDragOver]     = useState(null)

  useEffect(() => { localStorage.setItem('plan_start', startDate) }, [startDate])
  useEffect(() => { localStorage.setItem('sched_overrides', JSON.stringify(overrides)) }, [overrides])
  useEffect(() => { localStorage.setItem('cal_crossed', JSON.stringify([...crossed])) }, [crossed])

  function toggleCrossed(id) {
    setCrossed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const schedule = useMemo(() => {
    const base = buildSchedule(posts, startDate)
    return { ...base, ...overrides }
  }, [posts, startDate, overrides])

  const postsByDate = useMemo(() => {
    const map = {}
    posts.forEach(p => {
      const d = schedule[p.id]
      if (!d) return
      if (!map[d]) map[d] = []
      map[d].push(p)
    })
    return map
  }, [posts, schedule])

  const cells = useMemo(() => {
    const start = startOfMonth(displayMonth)
    const end   = endOfMonth(displayMonth)
    const grid  = []
    const pad   = (getDay(start) + 6) % 7
    for (let i = 0; i < pad; i++) grid.push(null)
    eachDayOfInterval({ start, end }).forEach(d => grid.push(d))
    while (grid.length % 7 !== 0) grid.push(null)
    return grid
  }, [displayMonth])

  function handleDrop(day) {
    if (!draggingId || !day) return
    setOverrides(prev => ({ ...prev, [draggingId]: format(day, 'yyyy-MM-dd') }))
    setDraggingId(null)
    setDragOver(null)
  }

  function openEdit(post) {
    setEditPost(post)
    setEditTitle(post.title)
  }

  function saveEdit() {
    if (editTitle.trim() && editTitle !== editPost.title) {
      updatePost(editPost.id, { title: editTitle.trim() })
    }
    setEditPost(null)
  }

  function handleDelete(id) {
    deletePost(id)
    setEditPost(null)
  }

  function resetSchedule(newStart) {
    setStartDate(newStart)
    setOverrides({})
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Content Schedule</h1>
          <p className="text-sm text-tac-200 mt-0.5">Your 60-day posting plan · click to mark done · double-click to edit · drag to reschedule</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Plan start date */}
          <div className="flex items-center gap-2 bg-tac-800 border border-tac-700 rounded-xl px-3 py-2">
            <CalendarDays size={14} className="text-flo shrink-0" />
            <span className="text-xs text-tac-300 whitespace-nowrap">Plan starts</span>
            <input
              type="date"
              value={startDate}
              onChange={e => resetSchedule(e.target.value)}
              className="text-xs font-semibold text-stone-100 outline-none bg-transparent"
            />
          </div>
          {/* Month nav */}
          <div className="flex items-center bg-tac-800 border border-tac-700 rounded-xl overflow-hidden">
            <button onClick={() => setDisplayMonth(m => subMonths(m, 1))} className="p-2 hover:bg-tac-700 text-tac-200 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 text-sm font-semibold text-stone-100 min-w-36 text-center">
              {format(displayMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setDisplayMonth(m => addMonths(m, 1))} className="p-2 hover:bg-tac-700 text-tac-200 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Calendar grid */}
        <div className="flex-1 bg-tac-800 border border-tac-700 rounded-2xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-tac-700 bg-tac-750">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-tac-300 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((day, idx) => {
              const dateKey    = day ? format(day, 'yyyy-MM-dd') : null
              const dayPosts   = dateKey ? (postsByDate[dateKey] ?? []) : []
              const todayCell  = day && isToday(day)
              const isDragTarget = dateKey && dragOver === dateKey

              return (
                <div
                  key={idx}
                  className={`min-h-[5.5rem] border-b border-r border-tac-700/50 p-1.5 transition-colors ${
                    !day         ? 'bg-tac-750/30' :
                    isDragTarget ? 'bg-flo/5 border-flo/20' :
                    todayCell    ? 'bg-tan/5' : ''
                  }`}
                  onDragOver={day ? e => { e.preventDefault(); setDragOver(dateKey) } : undefined}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={day ? () => handleDrop(day) : undefined}
                >
                  {day && (
                    <>
                      <p className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full leading-none ${
                        todayCell ? 'bg-flo text-tac-950' : 'text-tac-400'
                      }`}>
                        {format(day, 'd')}
                      </p>
                      <div className="space-y-0.5">
                        {dayPosts.map(post => {
                          const isCrossed = crossed.has(post.id)
                          return (
                            <div
                              key={post.id}
                              draggable
                              onDragStart={e => { e.stopPropagation(); setDraggingId(post.id) }}
                              onDragEnd={() => { setDraggingId(null); setDragOver(null) }}
                              onClick={() => toggleCrossed(post.id)}
                              onDoubleClick={() => openEdit(post)}
                              title={isCrossed ? 'Click to unmark · Double-click to edit' : 'Click to mark done · Double-click to edit'}
                              className={`text-xs px-1.5 py-0.5 rounded border cursor-pointer truncate select-none transition-all ${
                                CHIP_COLORS[post.platform] ?? CHIP_COLORS.multi
                              } ${isCrossed ? 'opacity-30 line-through' : 'hover:opacity-80'}`}
                            >
                              {post.title}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Edit panel */}
        {editPost ? (
          <div className="w-72 bg-tac-800 border border-tac-700 rounded-2xl p-5 shrink-0 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-100 text-sm">Edit Post</h3>
              <button onClick={() => setEditPost(null)} className="text-tac-400 hover:text-tac-100 p-0.5 transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-tac-300 font-medium block mb-1">Title</label>
                <textarea
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && saveEdit()}
                  rows={3}
                  className="input-tac w-full resize-none"
                />
              </div>

              {/* Post meta */}
              <div className="space-y-1.5">
                {[
                  ['Pillar',   editPost.pillar ?? '—'],
                  ['Platform', editPost.platform],
                  ['Status',   editPost.status],
                  ['Position', editPost.position ? `#${editPost.position} in Month ${editPost.month}` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-tac-400">{k}</span>
                    <span className="font-medium text-tac-100 capitalize">{v}</span>
                  </div>
                ))}
                {editPost.effort && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-tac-400">Effort</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${EFFORT_COLORS[editPost.effort] ?? ''}`}>
                      {editPost.effort}
                    </span>
                  </div>
                )}
              </div>

              {/* Hook preview */}
              {editPost.hook && (
                <div className="bg-tan/5 border-l-2 border-tan rounded-r-xl p-2.5 text-xs text-tac-100 italic leading-relaxed">
                  "{editPost.hook.length > 120 ? editPost.hook.slice(0, 120) + '…' : editPost.hook}"
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-flo hover:bg-flo/90 text-tac-950 text-xs font-bold rounded-xl transition-colors"
                >
                  <Save size={12} /> Save
                </button>
                <button
                  onClick={() => { if (confirm('Delete this post?')) handleDelete(editPost.id) }}
                  className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-xl transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Legend when no post is being edited */
          <div className="w-52 shrink-0 space-y-3">
            <div className="bg-tac-800 border border-tac-700 rounded-2xl p-4">
              <p className="text-xs font-semibold text-tac-300 uppercase tracking-wide mb-3">Platforms</p>
              <div className="space-y-1.5">
                {Object.entries({ instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook', multi: 'Multi' }).map(([k, v]) => (
                  <span key={k} className={`block text-xs px-2 py-1 rounded-lg border ${CHIP_COLORS[k]}`}>{v}</span>
                ))}
              </div>
            </div>
            <div className="bg-tac-800 border border-tac-700 rounded-2xl p-4">
              <p className="text-xs font-semibold text-tac-300 uppercase tracking-wide mb-2">Tips</p>
              <ul className="space-y-1.5 text-xs text-tac-400">
                <li>· <span className="text-tac-200">Click</span> a chip to mark done / undo</li>
                <li>· <span className="text-tac-200">Double-click</span> to edit or delete</li>
                <li>· <span className="text-tac-200">Drag</span> a chip to reschedule</li>
                <li>· Change "Plan starts" to shift the entire schedule</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
