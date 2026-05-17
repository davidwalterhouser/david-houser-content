import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Check } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useGrowth } from '../../hooks/useGrowth.js'
import { differenceInDays, parseISO } from 'date-fns'

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook']

const META = {
  instagram: { label: 'Instagram', color: '#ec4899' },
  tiktok:    { label: 'TikTok',    color: '#06b6d4' },
  youtube:   { label: 'YouTube',   color: '#ef4444' },
  facebook:  { label: 'Facebook',  color: '#3b82f6' },
}

function fmt(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000)    return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-tac-800 border border-tac-600 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-tac-100 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-tac-300">{META[p.dataKey]?.label}</span>
          <span className="ml-auto font-semibold text-stone-100">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function GrowthDashboard() {
  const { goals, current, history, loading, logCount, updateGoal, refresh } = useGrowth()

  const [inputs,   setInputs]   = useState({})
  const [saved,    setSaved]    = useState(false)
  const [editGoal, setEditGoal] = useState(null)

  const goalMap = Object.fromEntries(goals.map(g => [g.platform, g]))

  const totalFollowers = PLATFORMS.reduce((s, p) => s + (current[p] ?? 0), 0)
  const totalGained    = PLATFORMS.reduce((s, p) => {
    const g = goalMap[p]
    return s + (g ? Math.max(0, (current[p] ?? 0) - g.start_count) : 0)
  }, 0)

  async function handleSave() {
    const counts = {}
    PLATFORMS.forEach(p => {
      const v = parseInt(inputs[p], 10)
      if (!isNaN(v) && v > 0) counts[p] = v
    })
    if (Object.keys(counts).length === 0) return
    await logCount(counts)
    setInputs({})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Growth</h1>
          <p className="text-sm text-tac-200 mt-0.5">90-day follower tracker · update once a month to see trends</p>
        </div>
        <button onClick={refresh} className="p-2 rounded-lg text-tac-200 hover:bg-tac-700 border border-tac-700 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-tac-200">Loading growth data…</div>
      ) : (<>

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5 hover:border-tac-500 transition-colors">
            <p className="text-xs font-medium text-tac-200 uppercase tracking-wide mb-1">Total followers</p>
            <p className="text-4xl font-bold text-stone-100">{fmt(totalFollowers)}</p>
            <p className="text-sm text-tac-300 mt-1">across all platforms</p>
          </div>
          <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5 hover:border-tac-500 transition-colors">
            <p className="text-xs font-medium text-tac-200 uppercase tracking-wide mb-1">Total gained (90-day)</p>
            <p className="text-4xl font-bold text-flo">+{fmt(totalGained)}</p>
            <p className="text-sm text-tac-300 mt-1">since campaign start</p>
          </div>
        </div>

        {/* Platform stat cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {PLATFORMS.map(p => {
            const g     = goalMap[p]
            const count = current[p] ?? 0
            const start = g?.start_count ?? 0
            const goal  = g?.goal_count  ?? 0
            const gained = Math.max(0, count - start)
            const pct   = goal === start ? 0 : Math.min(100, Math.round((gained / (goal - start)) * 100))
            const meta  = META[p]

            const len  = history.length
            const prev = len >= 2 ? (history[len - 2]?.[p] ?? 0) : 0
            const diff = count - prev
            const up   = diff >= 0

            let daysLeft = 90
            if (g?.start_date) {
              daysLeft = Math.max(0, 90 - differenceInDays(new Date(), parseISO(g.start_date)))
            }

            return (
              <div key={p} className="bg-tac-800 rounded-2xl border border-tac-700 overflow-hidden hover:border-tac-500 transition-colors">
                <div className="h-1.5 w-full" style={{ background: meta.color }} />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-tac-100">{meta.label}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-medium ${up ? 'text-flo' : 'text-red-400'}`}>
                      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {up ? '+' : ''}{fmt(diff)}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-stone-100 mb-1">{fmt(count)}</p>
                  <p className="text-xs text-tac-300 mb-3">
                    +{fmt(gained)} gained · {daysLeft}d left
                  </p>

                  {/* Goal progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-tac-300">
                      <span>{pct}% to goal</span>
                      <span>{fmt(goal)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-tac-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>

                  {/* Edit goal */}
                  {editGoal?.platform === p ? (
                    <div className="flex gap-1 mt-2">
                      <input
                        autoFocus
                        type="number"
                        value={editGoal.value}
                        onChange={e => setEditGoal(v => ({ ...v, value: e.target.value }))}
                        className="input-tac flex-1 text-xs py-1"
                        placeholder="New goal"
                      />
                      <button
                        onClick={() => { updateGoal(p, { goal_count: parseInt(editGoal.value, 10) }); setEditGoal(null) }}
                        className="px-2 py-1 bg-flo text-tac-950 rounded text-xs font-bold"
                      >✓</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditGoal({ platform: p, value: String(goal) })}
                      className="mt-2 text-xs text-tac-400 hover:text-flo transition-colors"
                    >
                      Edit goal
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Trend chart */}
        <div className="bg-tac-800 border border-tac-700 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-tac-100 mb-4">Follower growth over time</h2>
          {history.length < 2 ? (
            <div className="flex items-center justify-center h-48 text-tac-300 text-sm">
              Log counts at least twice to see trend lines
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#24241C" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#808068' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#808068' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => fmt(v)}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={v => <span style={{ fontSize: 12, color: '#808068' }}>{META[v]?.label}</span>}
                />
                {PLATFORMS.map(p => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    stroke={META[p].color}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: META[p].color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly count log */}
        <div className="bg-tac-800 border border-tac-700 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-sm font-semibold text-tac-100">Update follower counts</h2>
            <span className="text-xs bg-tan/10 text-tan font-medium px-2 py-0.5 rounded-full border border-tan/25">
              Monthly check-in
            </span>
          </div>
          <p className="text-xs text-tac-300 mb-4">Once a month, enter your current counts — leave any platform blank to skip it</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PLATFORMS.map(p => {
              const meta = META[p]
              return (
                <div key={p}>
                  <label className="text-xs font-semibold block mb-1" style={{ color: meta.color }}>{meta.label}</label>
                  <input
                    type="number"
                    value={inputs[p] ?? ''}
                    onChange={e => setInputs(prev => ({ ...prev, [p]: e.target.value }))}
                    placeholder={fmt(current[p]) ?? '0'}
                    className="input-tac w-full"
                  />
                </div>
              )
            })}
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saved
                ? 'bg-flo text-tac-950'
                : 'bg-flo hover:bg-flo/90 text-tac-950'
            }`}
          >
            {saved ? <><Check size={15} /> Saved!</> : 'Save counts'}
          </button>
        </div>

      </>)}
    </div>
  )
}
