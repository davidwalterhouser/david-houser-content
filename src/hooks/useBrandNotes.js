import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const LS_KEY = 'brand_notes'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}
function saveLocal(notes) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(notes)) } catch {}
}

export function useBrandNotes() {
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    if (!supabase) {
      setNotes(loadLocal())
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('brand_notes')
      .select('*')
      .order('created_at', { ascending: false })
    setNotes(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addNote = useCallback(async (note) => {
    const newNote = { ...note, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    setNotes(prev => {
      const next = [newNote, ...prev]
      if (!supabase) saveLocal(next)
      return next
    })
    if (!supabase) return
    await supabase.from('brand_notes').insert(note)
  }, [])

  const deleteNote = useCallback(async (id) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id)
      if (!supabase) saveLocal(next)
      return next
    })
    if (!supabase) return
    await supabase.from('brand_notes').delete().eq('id', id)
  }, [])

  return { notes, loading, addNote, deleteNote, refresh: fetch }
}
