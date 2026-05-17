import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const LS_KEY = 'idea_log'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function saveLocal(ideas) {
  localStorage.setItem(LS_KEY, JSON.stringify(ideas))
}

export function useIdeas() {
  const [ideas,   setIdeas]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (!supabase) {
      setIdeas(loadLocal())
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false })
    setIdeas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addIdea = useCallback(async (idea) => {
    const newIdea = {
      ...idea,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: 'raw',
    }
    setIdeas(prev => {
      const next = [newIdea, ...prev]
      if (!supabase) saveLocal(next)
      return next
    })
    if (!supabase) return newIdea
    const { data } = await supabase.from('ideas').insert(idea).select().single()
    if (data) setIdeas(prev => [data, ...prev.filter(i => i.id !== newIdea.id)])
    return data ?? newIdea
  }, [])

  const updateIdea = useCallback(async (id, fields) => {
    setIdeas(prev => {
      const next = prev.map(i => i.id === id ? { ...i, ...fields } : i)
      if (!supabase) saveLocal(next)
      return next
    })
    if (!supabase) return
    await supabase.from('ideas').update(fields).eq('id', id)
  }, [])

  const deleteIdea = useCallback(async (id) => {
    setIdeas(prev => {
      const next = prev.filter(i => i.id !== id)
      if (!supabase) saveLocal(next)
      return next
    })
    if (!supabase) return
    await supabase.from('ideas').delete().eq('id', id)
  }, [])

  return { ideas, loading, addIdea, updateIdea, deleteIdea, refresh: fetch }
}
