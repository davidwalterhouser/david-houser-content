import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { DEMO_TASKS } from '../data/demoTasks.js'

export function useRoadmap() {
  const [tasks,   setTasks]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (!supabase) { setTasks(DEMO_TASKS); setLoading(false); return }
    const { data } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .order('week')
      .order('created_at')
    setTasks(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const updateTask = useCallback(async (id, fields) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...fields } : t))
    if (!supabase) return
    await supabase.from('roadmap_tasks').update(fields).eq('id', id)
  }, [])

  const addTask = useCallback(async (task) => {
    const newTask = { ...task, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    setTasks(prev => [...prev, newTask])
    if (!supabase) return newTask
    const { data } = await supabase.from('roadmap_tasks').insert(task).select().single()
    if (data) setTasks(prev => [...prev.filter(t => t.id !== newTask.id), data])
    return data ?? newTask
  }, [])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    if (!supabase) return
    await supabase.from('roadmap_tasks').delete().eq('id', id)
  }, [])

  return { tasks, loading, updateTask, addTask, deleteTask, refresh: fetch }
}
