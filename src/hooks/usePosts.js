import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { DEMO_POSTS } from '../data/demoPosts.js'

// Inject a handful of demo "already posted" posts with realistic stats so the Posted tab has something to show
const DEMO_POSTED = [
  {
    ...DEMO_POSTS[0],
    status: 'posted',
    posted_at: '2026-04-28',
    post_url: 'https://instagram.com',
    stats: { views: 47200, likes: 3100, saves: 892, shares: 445, comments: 67, reach: 38400 },
  },
  {
    ...DEMO_POSTS[1],
    status: 'posted',
    posted_at: '2026-04-29',
    stats: { views: 12800, likes: 980, saves: 234, shares: 112, comments: 41, reach: 11200 },
  },
  {
    ...DEMO_POSTS[2],
    status: 'posted',
    posted_at: '2026-05-01',
    stats: { views: 8900, likes: 610, saves: 178, shares: 89, comments: 28, reach: 7600 },
  },
  {
    ...DEMO_POSTS[3],
    status: 'posted',
    posted_at: '2026-05-03',
    stats: { views: 5200, likes: 380, saves: 95, shares: 44, comments: 19, reach: 4800 },
  },
  {
    ...DEMO_POSTS[4],
    status: 'posted',
    posted_at: '2026-05-07',
    stats: {},
  },
]

const DEMO_ALL = [...DEMO_POSTED, ...DEMO_POSTS.slice(5)]

const LS_KEY = 'post_data'

function loadLocalPosts() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
    if (!stored || stored.length === 0) return DEMO_ALL
    return stored
  } catch { return DEMO_ALL }
}

function saveLocalPosts(posts) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(posts)) } catch {}
}

export function usePosts() {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    if (!supabase && loaded) saveLocalPosts(posts)
  }, [posts, loaded])

  const fetch = useCallback(async () => {
    if (!supabase) { setPosts(loadLocalPosts()); setLoading(false); setLoaded(true); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('month')
      .order('position')
    if (error) setError(error.message)
    else setPosts(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const updateStatus = useCallback(async (id, status) => {
    const extra = status === 'posted' ? { posted_at: new Date().toISOString().slice(0, 10) } : {}
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p))
    if (!supabase) return
    await supabase.from('posts').update({ status, ...extra }).eq('id', id)
  }, [])

  const updatePost = useCallback(async (id, fields) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p))
    if (!supabase) return
    await supabase.from('posts').update(fields).eq('id', id)
  }, [])

  const updateStats = useCallback(async (id, stats) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, stats } : p))
    if (!supabase) return
    await supabase.from('posts').update({ stats }).eq('id', id)
  }, [])

  const addPost = useCallback(async (post) => {
    if (!supabase) {
      const newPost = { ...post, id: crypto.randomUUID(), created_at: new Date().toISOString() }
      setPosts(prev => [...prev, newPost])
      return newPost
    }
    const { data, error } = await supabase.from('posts').insert(post).select().single()
    if (!error) setPosts(prev => [...prev, data])
    return data
  }, [])

  const deletePost = useCallback(async (id) => {
    setPosts(prev => prev.filter(p => p.id !== id))
    if (!supabase) return
    await supabase.from('posts').delete().eq('id', id)
  }, [])

  return { posts, loading, error, updateStatus, updatePost, updateStats, addPost, deletePost, refresh: fetch }
}
