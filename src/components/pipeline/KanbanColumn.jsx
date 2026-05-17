import PostCard from './PostCard.jsx'

const STATUS_META = {
  filming: { label: 'Filming', dot: 'bg-tan',      border: 'border-tac-700', header: 'border-tac-700' },
  editing: { label: 'Editing', dot: 'bg-blue-400', border: 'border-tac-700', header: 'border-tac-700' },
  ready:   { label: 'Ready',   dot: 'bg-flo',      border: 'border-flo/20',  header: 'border-flo/15'  },
  posted:  { label: 'Posted',  dot: 'bg-tac-400',  border: 'border-tac-700', header: 'border-tac-700' },
}

export default function KanbanColumn({ status, posts, onStatusChange, onUpdate, onDelete, onOpenScript, compact }) {
  const meta = STATUS_META[status]
  return (
    <div className={`flex flex-col rounded-2xl border bg-tac-800 ${meta.border} min-w-0`}>
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${meta.header}`}>
        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
        <span className="font-semibold text-sm text-stone-100">{meta.label}</span>
        <span className="ml-auto text-xs font-medium text-tac-200 bg-tac-700 px-2 py-0.5 rounded-full border border-tac-600">
          {posts.length}
        </span>
      </div>
      <div className={`flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin ${compact ? 'max-h-[calc(50vh-140px)]' : 'max-h-[calc(100vh-220px)]'}`}>
        {posts.length === 0 && (
          <p className="text-xs text-tac-300 text-center py-8">Empty</p>
        )}
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onStatusChange={onStatusChange}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onOpenScript={onOpenScript}
          />
        ))}
      </div>
    </div>
  )
}
