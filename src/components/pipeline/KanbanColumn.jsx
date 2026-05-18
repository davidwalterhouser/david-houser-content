import { useState } from 'react'
import { GripVertical } from 'lucide-react'
import PostCard from './PostCard.jsx'

const STATUS_META = {
  filming: { label: 'To Film', dot: 'bg-tan',      border: 'border-tac-700', header: 'border-tac-700' },
  editing: { label: 'Editing', dot: 'bg-blue-400', border: 'border-tac-700', header: 'border-tac-700' },
  ready:   { label: 'Ready',   dot: 'bg-flo',      border: 'border-flo/20',  header: 'border-flo/15'  },
  posted:  { label: 'Posted',  dot: 'bg-tac-400',  border: 'border-tac-700', header: 'border-tac-700' },
}

export default function KanbanColumn({ status, posts, onStatusChange, onUpdate, onDelete, onOpenScript, compact }) {
  const meta = STATUS_META[status]
  const [dragId,     setDragId]     = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [dragAbove,  setDragAbove]  = useState(true) // drop above or below target

  function handleDragStart(e, postId) {
    setDragId(postId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', postId)
  }

  function handleDragOver(e, postId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (postId === dragId) return
    setDragOverId(postId)
    // Determine if hovering top or bottom half
    const rect = e.currentTarget.getBoundingClientRect()
    setDragAbove(e.clientY < rect.top + rect.height / 2)
  }

  function handleDrop(e, postId) {
    e.preventDefault()
    if (!dragId || dragId === postId) {
      setDragId(null); setDragOverId(null)
      return
    }

    const fromIdx = posts.findIndex(p => p.id === dragId)
    const toIdx   = posts.findIndex(p => p.id === postId)
    if (fromIdx === -1 || toIdx === -1) return

    const reordered = [...posts]
    const [moved] = reordered.splice(fromIdx, 1)
    // Insert above or below target
    const insertAt = dragAbove
      ? reordered.findIndex(p => p.id === postId)
      : reordered.findIndex(p => p.id === postId) + 1
    reordered.splice(insertAt, 0, moved)

    reordered.forEach((p, i) => onUpdate(p.id, { position: i + 1 }))
    setDragId(null); setDragOverId(null)
  }

  function handleDragEnd() {
    setDragId(null); setDragOverId(null)
  }

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
        {posts.map(post => {
          const isOver  = dragOverId === post.id
          const isDragging = dragId === post.id
          return (
            <div
              key={post.id}
              draggable
              onDragStart={e => handleDragStart(e, post.id)}
              onDragOver={e => handleDragOver(e, post.id)}
              onDrop={e => handleDrop(e, post.id)}
              onDragEnd={handleDragEnd}
              className={`relative group transition-opacity ${isDragging ? 'opacity-30' : 'opacity-100'}`}
            >
              {/* Drop indicator line */}
              {isOver && dragAbove  && <div className="absolute -top-1 left-2 right-2 h-0.5 rounded-full bg-flo z-10" />}
              {isOver && !dragAbove && <div className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-flo z-10" />}

              {/* Drag handle */}
              <div className="absolute left-1.5 top-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                <GripVertical size={14} className="text-tac-500" />
              </div>

              <div className={`transition-all ${isOver ? 'scale-[1.01]' : ''}`}>
                <PostCard
                  post={post}
                  onStatusChange={onStatusChange}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onOpenScript={onOpenScript}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
