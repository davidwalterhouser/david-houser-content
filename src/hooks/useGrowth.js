import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { format, subDays } from 'date-fns'

const LS_KEY = 'growth_data'

function loadLocalGrowth() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || 'null') ?? null
  } catch { return null }
}

function saveLocalGrowth(goals, history, current) {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ goals, history, current })) } catch {}
}

const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'facebook']

// Starting follower counts for demo goals
const DEMO_STARTS = { instagram: 2400, tiktok: 1800, youtube: 620, facebook: 980 }
const DEMO_GOALS  = { instagram: 10000, tiktok: 8000, youtube: 5000, facebook: 4000 }

// Generate realistic-looking demo history (9 weekly snapshots going back ~8 weeks)
function buildDemoHistory() {
  const today = new Date()
  const points = []
  // weekly snapshots from 8 weeks ago → today
  for (let weeksAgo = 8; weeksAgo >= 0; weeksAgo--) {
    const d = subDays(today, weeksAgo * 7)
    const pct = (8 - weeksAgo) / 8               // 0 = oldest, 1 = today
    const jitter = () => Math.round((Math.random() - 0.3) * 15)
    points.push({
      date:      format(d, 'MMM d'),
      instagram: Math.round(DEMO_STARTS.instagram + pct * 350 + jitter()),
      tiktok:    Math.round(DEMO_STARTS.tiktok   + pct * 280 + jitter()),
      youtube:   Math.round(DEMO_STARTS.youtube  + pct * 110 + jitter()),
      facebook:  Math.round(DEMO_STARTS.facebook + pct * 135 + jitter()),
    })
  }
  return points
}

function buildDemoGoals() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const end   = format(subDays(new Date(), -90), 'yyyy-MM-dd')
  return PLATFORMS.map(p => ({
    id: p, platform: p,
    start_count: DEMO_STARTS[p],
    goal_count:  DEMO_GOALS[p],
    start_date: today, end_date: end,
  }))
}

export function useGrowth() {
  const [goals,   setGoals]   = useState([])
  const [current, setCurrent] = useState({})   // { platform: count }
  const [history, setHistory] = useState([])   // [{ date, instagram, tiktok, youtube, facebook }]
  const [loading, setLoading] = useState(true)
  const [loaded,  setLoaded]  = useState(false)

  useEffect(() => {
    if (!supabase && loaded) saveLocalGrowth(goals, history, current)
  }, [goals, history, current, loaded])

  const fetch = useCallback(async () => {
    setLoading(true)

    if (!supabase) {
      const saved = loadLocalGrowth()
      if (saved) {
        setGoals(saved.goals)
        setHistory(saved.history)
        setCurrent(saved.current)
      } else {
        const demo = buildDemoHistory()
        setGoals(buildDemoGoals())
        setHistory(demo)
        const last = demo[demo.length - 1]
        setCurrent({ instagram: last.instagram, tiktok: last.tiktok, youtube: last.youtube, facebook: last.facebook })
      }
      setLoading(false)
      setLoaded(true)
      return
    }

    const [{ data: goalData }, { data: metricData }] = await Promise.all([
      supabase.from('growth_goals').select('*'),
      supabase.from('growth_metrics')
        .select('platform, follower_count, recorded_date')
        .order('recorded_date', { ascending: true }),
    ])

    setGoals(goalData ?? [])

    // Build current map (latest per platform)
    const cur = {}
    ;(metricData ?? []).forEach(m => { cur[m.platform] = m.follower_count })
    setCurrent(cur)

    // Pivot metrics into chart-friendly rows: [{ date, instagram, tiktok, ... }]
    const byDate = {}
    ;(metricData ?? []).forEach(m => {
      const label = format(new Date(m.recorded_date), 'MMM d')
      if (!byDate[label]) byDate[label] = { date: label }
      byDate[label][m.platform] = m.follower_count
    })
    setHistory(Object.values(byDate))

    setLoading(false)
    setLoaded(true)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const logCount = useCallback(async (counts) => {
    // counts = { instagram: 2500, tiktok: 1900, ... }
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayLabel = format(new Date(), 'MMM d')

    setCurrent(prev => ({ ...prev, ...counts }))
    setHistory(prev => {
      const last = prev[prev.length - 1]
      if (last?.date === todayLabel) {
        return [...prev.slice(0, -1), { ...last, ...counts }]
      }
      return [...prev, { date: todayLabel, ...counts }]
    })

    if (!supabase) return
    await Promise.all(
      Object.entries(counts).map(([platform, follower_count]) =>
        supabase.from('growth_metrics').upsert(
          { platform, follower_count, recorded_date: today },
          { onConflict: 'platform,recorded_date' }
        )
      )
    )
  }, [])

  const updateGoal = useCallback(async (platform, fields) => {
    setGoals(prev => prev.map(g => g.platform === platform ? { ...g, ...fields } : g))
    if (!supabase) return
    await supabase.from('growth_goals').update(fields).eq('platform', platform)
  }, [])

  return { goals, current, history, loading, logCount, updateGoal, refresh: fetch }
}
