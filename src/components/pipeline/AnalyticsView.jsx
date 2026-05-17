import { usePosts } from '../../hooks/usePosts.js'
import PostedTab from './PostedTab.jsx'
import { BarChart2 } from 'lucide-react'

export default function AnalyticsView() {
  const { posts, loading, updateStats, updatePost } = usePosts()

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-flo/10 border border-flo/20 flex items-center justify-center">
          <BarChart2 size={20} className="text-flo" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Analytics</h1>
          <p className="text-sm text-tac-200 mt-0.5">
            Log stats after each post goes live · see what's hitting with your audience
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-tac-200">Loading posts…</div>
      ) : (
        <PostedTab
          posts={posts}
          onUpdateStats={updateStats}
          onUpdatePost={updatePost}
        />
      )}
    </div>
  )
}
