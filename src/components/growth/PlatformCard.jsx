import { useState } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { TrendingUp, Edit3, Check } from 'lucide-react'

const PLATFORM_META = {
  instagram: { label: 'Instagram', color: 'from-pink-500 to-rose-500',    light: 'bg-pink-50',  border: 'border-pink-200',  ring: 'focus:ring-pink-300'  },
  tiktok:    { label: 'TikTok',    color: 'from-cyan-500 to-teal-500',    light: 'bg-cyan-50',  border: 'border-cyan-200',  ring: 'focus:ring-cyan-300'  },
  youtube:   { label: 'YouTube',   color: 'from-red-500 to-orange-500',   light: 'bg-red-50',   border: 'border-red-200',   ring: 'focus:ring-red-300'   },
  facebook:  { label: 'Facebook',  color: 'from-blue-500 to-indigo-500',  light: 'bg-blue-50',  border: 'border-blue-200',  ring: 'focus:ring-blue-300'  },
}

const ICONS = {
  instagram: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  tiktok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/>
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
}

function fmt(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n/1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

export default function PlatformCard({ platform, goal, currentCount, onUpdateCount, onUpdateGoal }) {
  const meta = PLATFORM_META[platform]
  const Icon = ICONS[platform]

  const [editingCount, setEditingCount] = useState(false)
  const [editingGoal,  setEditingGoal]  = useState(false)
  const [countInput,   setCountInput]   = useState(String(currentCount ?? goal?.start_count ?? 0))
  const [goalInput,    setGoalInput]    = useState(String(goal?.goal_count ?? 10000))

  const count = currentCount ?? goal?.start_count ?? 0
  const start = goal?.start_count ?? 0
  const target = goal?.goal_count ?? 10000
  const gained = Math.max(0, count - start)
  const needed = Math.max(0, target - count)
  const progress = target === start ? 0 : Math.min(100, Math.round((gained / (target - start)) * 100))

  let daysElapsed = 0
  let daysLeft = 90
  if (goal?.start_date) {
    daysElapsed = Math.max(0, differenceInDays(new Date(), parseISO(goal.start_date)))
    daysLeft    = Math.max(0, 90 - daysElapsed)
  }

  function saveCount() {
    const n = parseInt(countInput, 10)
    if (!isNaN(n) && n >= 0) onUpdateCount(platform, n)
    setEditingCount(false)
  }

  function saveGoal() {
    const n = parseInt(goalInput, 10)
    if (!isNaN(n) && n > 0) onUpdateGoal(platform, { goal_count: n })
    setEditingGoal(false)
  }

  return (
    <div className={`bg-white rounded-2xl border ${meta.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${meta.color} p-5 text-white`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon />
            </div>
            <span className="font-semibold">{meta.label}</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{daysLeft}d left</span>
        </div>

        {/* Current count */}
        <div className="flex items-end gap-2">
          {editingCount ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="number"
                value={countInput}
                onChange={e => setCountInput(e.target.value)}
                onBlur={saveCount}
                onKeyDown={e => e.key === 'Enter' && saveCount()}
                className="w-28 bg-white/20 border border-white/40 text-white placeholder-white/60 rounded-lg px-2 py-1 text-lg font-bold outline-none"
              />
              <button onClick={saveCount}><Check size={16} /></button>
            </div>
          ) : (
            <button
              onClick={() => { setCountInput(String(count)); setEditingCount(true) }}
              className="flex items-center gap-2 group"
            >
              <span className="text-3xl font-bold">{fmt(count)}</span>
              <Edit3 size={14} className="opacity-0 group-hover:opacity-80 transition-opacity" />
            </button>
          )}
        </div>
        <p className="text-white/70 text-xs mt-0.5">followers · click to update</p>
      </div>

      {/* Progress section */}
      <div className="p-5 space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{fmt(start)} start</span>
            <span className="font-semibold text-gray-700">{progress}%</span>
            <span>
              {editingGoal ? (
                <span className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="number"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onBlur={saveGoal}
                    onKeyDown={e => e.key === 'Enter' && saveGoal()}
                    className="w-20 border border-gray-200 rounded px-1 text-xs outline-none"
                  />
                  <button onClick={saveGoal}><Check size={11} /></button>
                </span>
              ) : (
                <button onClick={() => { setGoalInput(String(target)); setEditingGoal(true) }}
                  className="flex items-center gap-1 hover:text-gray-700 group">
                  {fmt(target)} goal
                  <Edit3 size={10} className="opacity-0 group-hover:opacity-80" />
                </button>
              )}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className={`${meta.light} rounded-xl p-2.5`}>
            <p className="text-xs text-gray-500">Gained</p>
            <p className="text-sm font-bold text-gray-800">+{fmt(gained)}</p>
          </div>
          <div className={`${meta.light} rounded-xl p-2.5`}>
            <p className="text-xs text-gray-500">Needed</p>
            <p className="text-sm font-bold text-gray-800">{fmt(needed)}</p>
          </div>
          <div className={`${meta.light} rounded-xl p-2.5`}>
            <p className="text-xs text-gray-500">Day</p>
            <p className="text-sm font-bold text-gray-800">{daysElapsed}</p>
          </div>
        </div>

        {/* Daily pace needed */}
        {daysLeft > 0 && needed > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
            <TrendingUp size={13} className="text-gray-400" />
            <span>Need <strong className="text-gray-700">{Math.ceil(needed / daysLeft)}</strong> followers/day to hit goal</span>
          </div>
        )}
        {needed <= 0 && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2">
            <Check size={13} />
            <span className="font-medium">Goal reached!</span>
          </div>
        )}
      </div>
    </div>
  )
}
