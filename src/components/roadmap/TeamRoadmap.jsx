import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import TaskCard from './TaskCard.jsx'
import { useRoadmap } from '../../hooks/useRoadmap.js'

const ASSIGNEES = ['all', 'me', 'editor', 'va']
const ASSIGNEE_META = {
  me:     { label: 'Me',     dot: 'bg-flo'       },
  editor: { label: 'Editor', dot: 'bg-blue-400'  },
  va:     { label: 'VA',     dot: 'bg-tan'       },
}

const STATUS_COLS = [
  { id: 'todo',        label: 'To Do',       border: 'border-tac-700', dot: 'bg-tac-400'  },
  { id: 'in-progress', label: 'In Progress', border: 'border-blue-900/50', dot: 'bg-blue-400' },
  { id: 'done',        label: 'Done',        border: 'border-flo/15',  dot: 'bg-flo'      },
]

const BLANK = { title:'', description:'', assignee:'me', priority:'medium', week:1, status:'todo' }

export default function TeamRoadmap() {
  const { tasks, loading, updateTask, addTask, deleteTask, refresh } = useRoadmap()
  const [assignee, setAssignee] = useState('all')
  const [showAdd,  setShowAdd]  = useState(false)
  const [newTask,  setNewTask]  = useState(BLANK)

  const visible   = assignee === 'all' ? tasks : tasks.filter(t => t.assignee === assignee)
  const byStatus  = (status) => visible.filter(t => t.status === status)
  const totalDone = tasks.filter(t => t.status === 'done').length
  const totalAll  = tasks.length

  async function handleAdd(e) {
    e.preventDefault()
    if (!newTask.title.trim()) return
    await addTask(newTask)
    setNewTask(BLANK)
    setShowAdd(false)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-stone-100">Team Roadmap</h1>
          <p className="text-sm text-tac-200 mt-0.5">
            {totalDone}/{totalAll} tasks complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-lg text-tac-200 hover:bg-tac-700 border border-tac-700 transition-colors">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-flo hover:bg-flo/90 text-tac-950 text-sm font-bold rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Add task form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-5 p-4 bg-tac-800 border border-flo/25 rounded-xl space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <label className="text-xs font-medium text-tac-200 block mb-1">Task title *</label>
              <input
                autoFocus required
                value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                placeholder="What needs to get done?"
                className="input-tac w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-tac-200 block mb-1">Assignee</label>
              <select value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
                className="input-tac">
                <option value="me">Me</option>
                <option value="editor">Editor</option>
                <option value="va">VA</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tac-200 block mb-1">Priority</label>
              <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                className="input-tac">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-tac-200 block mb-1">Week</label>
              <select value={newTask.week} onChange={e => setNewTask(p => ({ ...p, week: Number(e.target.value) }))}
                className="input-tac">
                {[1,2,3,4].map(w => <option key={w} value={w}>Week {w}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-tac-200 block mb-1">Description</label>
            <input
              value={newTask.description}
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional details for the assignee…"
              className="input-tac w-full"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-flo text-sm">Save</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-tac text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Assignee filter + legend */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1">
          {ASSIGNEES.map(a => (
            <button key={a} onClick={() => setAssignee(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                assignee === a
                  ? 'bg-flo/10 border-flo/30 text-flo'
                  : 'bg-tac-800 border-tac-700 text-tac-200 hover:border-tac-500'
              }`}
            >
              {a === 'all' ? 'All' : ASSIGNEE_META[a].label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                assignee === a ? 'bg-flo/20 text-flo' : 'bg-tac-700 text-tac-300'
              }`}>
                {a === 'all' ? tasks.length : tasks.filter(t => t.assignee === a).length}
              </span>
            </button>
          ))}
        </div>

        {/* Assignee dots legend */}
        <div className="ml-auto flex gap-3">
          {Object.entries(ASSIGNEE_META).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-tac-300">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} />
              {val.label}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban columns */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-tac-300">Loading tasks…</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {STATUS_COLS.map(col => (
            <div key={col.id} className={`flex flex-col rounded-2xl border bg-tac-800 ${col.border}`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${col.border}`}>
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="font-semibold text-sm text-stone-100">{col.label}</span>
                <span className="ml-auto text-xs font-medium text-tac-200 bg-tac-700 px-2 py-0.5 rounded-full border border-tac-600">
                  {byStatus(col.id).length}
                </span>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin max-h-[calc(100vh-260px)]">
                {byStatus(col.id).length === 0 && (
                  <p className="text-xs text-tac-400 text-center py-6">No tasks here</p>
                )}
                {byStatus(col.id).map(task => (
                  <div key={task.id} className="relative">
                    <span className={`absolute -top-1 -left-1 w-3 h-3 rounded-full border-2 border-tac-800 ${ASSIGNEE_META[task.assignee]?.dot ?? 'bg-tac-400'}`} />
                    <TaskCard task={task} onUpdate={updateTask} onDelete={deleteTask} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
