import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const PRIORITY_STYLES = {
  high:   'bg-red-900/40 text-red-400',
  medium: 'bg-tan/10 text-tan',
  low:    'bg-tac-700 text-tac-300',
}

const STATUS_OPTIONS = ['todo', 'in-progress', 'done']

const ASSIGNEE_OPTIONS = [
  { value: 'me',     label: 'Me',     dot: 'bg-flo'      },
  { value: 'editor', label: 'Editor', dot: 'bg-blue-400' },
  { value: 'va',     label: 'VA',     dot: 'bg-tan'      },
]

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const assignee = ASSIGNEE_OPTIONS.find(a => a.value === task.assignee) ?? ASSIGNEE_OPTIONS[0]

  return (
    <div className={`bg-tac-750 rounded-xl border transition-all ${
      task.status === 'done' ? 'border-tac-700 opacity-60' : 'border-tac-700 hover:border-tac-500'
    }`}>
      <div className="p-3">
        <div className="flex items-start gap-2 mb-2">
          {/* Status checkbox */}
          <button
            onClick={() => onUpdate(task.id, { status: task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done' })}
            className={`mt-0.5 w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
              task.status === 'done'
                ? 'bg-flo border-flo'
                : task.status === 'in-progress'
                ? 'border-blue-400 bg-blue-900/20'
                : 'border-tac-500'
            }`}
          >
            {task.status === 'done' && <span className="text-tac-950 text-xs font-bold">✓</span>}
            {task.status === 'in-progress' && <span className="w-2 h-2 bg-blue-400 rounded-sm" />}
          </button>

          <p className={`text-sm font-medium leading-snug flex-1 ${task.status === 'done' ? 'line-through text-tac-400' : 'text-stone-100'}`}>
            {task.title}
          </p>

          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Bottom row: week/due + assignee */}
        <div className="flex items-center justify-between gap-2 ml-6">
          <div className="flex items-center gap-2">
            {task.week && <span className="text-xs text-tac-400">Week {task.week}</span>}
            {task.due_date && <span className="text-xs text-tac-400">· Due {task.due_date}</span>}
          </div>

          {/* Assignee dropdown */}
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${assignee.dot}`} />
            <select
              value={task.assignee ?? 'me'}
              onChange={e => onUpdate(task.id, { assignee: e.target.value })}
              className="text-xs text-tac-300 bg-transparent border-none outline-none cursor-pointer hover:text-tac-100 transition-colors"
            >
              {ASSIGNEE_OPTIONS.map(a => (
                <option key={a.value} value={a.value} className="bg-tac-800 text-stone-100">
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expand */}
      {task.description && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-between px-3 py-1 text-xs text-tac-400 hover:text-flo border-t border-tac-700 transition-colors"
          >
            <span>Details</span>
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {expanded && (
            <div className="px-3 pb-3 space-y-3">
              <p className="text-xs text-tac-300 leading-relaxed">{task.description}</p>

              {/* Status control */}
              <div className="flex gap-1">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdate(task.id, { status: s })}
                    className={`text-xs px-2 py-1 rounded-md capitalize transition-colors ${
                      task.status === s
                        ? 'bg-flo text-tac-950 font-bold'
                        : 'bg-tac-700 text-tac-300 hover:bg-tac-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => onDelete(task.id)}
                className="flex items-center gap-1 text-xs text-red-500/60 hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} /> Delete
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
