import { LayoutDashboard, Workflow, CalendarRange, Activity, Rocket, Lightbulb, Flame } from 'lucide-react'

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: LayoutDashboard, desc: 'This week',        color: 'text-flo' },
  { id: 'pipeline',   label: 'Content Studio', icon: Workflow,        desc: 'Filming → Ready',  color: 'text-violet-400' },
  { id: 'ideas',      label: 'Ideas',          icon: Lightbulb,       desc: 'Voice + text',     color: 'text-yellow-400' },
  { id: 'schedule',   label: 'Schedule',       icon: CalendarRange,   desc: '60-day calendar',  color: 'text-sky-400' },
  { id: 'analytics',  label: 'Analytics',      icon: Activity,        desc: 'Post performance', color: 'text-emerald-400' },
  { id: 'growth',     label: 'Growth',         icon: Rocket,          desc: 'Monthly log',      color: 'text-orange-400' },
  { id: 'viral',      label: 'Viral Watch',    icon: Flame,           desc: 'Stay ahead',       color: 'text-red-400' },
]

export default function Sidebar({ activeView, onSelect }) {
  return (
    <aside className="w-56 shrink-0 bg-tac-950 flex flex-col h-full hex-bg border-r border-tac-700">

      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-tac-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-flo flex items-center justify-center font-bold text-sm text-tac-950 select-none shadow-flo-sm shrink-0">
            DH
          </div>
          <div>
            <p className="text-stone-100 font-semibold text-sm leading-tight">David Houser</p>
            <p className="text-tac-200 text-xs">Command Center</p>
          </div>
        </div>
        {/* Platform handles */}
        <div className="space-y-1">
          <a href="https://instagram.com/davidhouser" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-pink-950/40 group transition-colors">
            <span className="w-4 h-4 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-pink-400"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </span>
            <span className="text-xs text-tac-300 group-hover:text-pink-300 transition-colors font-medium">@davidhouser</span>
          </a>
          <a href="https://tiktok.com/@davidwhouser" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-cyan-950/40 group transition-colors">
            <span className="w-4 h-4 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-cyan-400"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.2 8.2 0 004.79 1.52V7.03a4.85 4.85 0 01-1.02-.34z"/></svg>
            </span>
            <span className="text-xs text-tac-300 group-hover:text-cyan-300 transition-colors font-medium">@davidwhouser</span>
          </a>
          <a href="https://youtube.com/@davidhouserarchery" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-red-950/40 group transition-colors">
            <span className="w-4 h-4 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-red-400"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </span>
            <span className="text-xs text-tac-300 group-hover:text-red-300 transition-colors font-medium">@davidhouserarchery</span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-blue-950/40 group transition-colors">
            <span className="w-4 h-4 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-blue-400"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </span>
            <span className="text-xs text-tac-300 group-hover:text-blue-300 transition-colors font-medium truncate">David Houser</span>
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV.map(({ id, label, icon: Icon, desc, color }) => {
          const active = activeView === id
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                active
                  ? 'bg-flo/10 border border-flo/25 text-flo'
                  : 'text-tac-200 border border-transparent hover:bg-tac-800 hover:text-tac-50'
              }`}
            >
              <Icon size={16} className={`shrink-0 ${active ? 'text-flo' : color}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-tight truncate">{label}</p>
                <p className={`text-xs leading-tight truncate ${active ? 'text-flo/60' : 'text-tac-300'}`}>{desc}</p>
              </div>
              {active && <div className="ml-auto w-1 h-4 rounded-full bg-flo shrink-0" />}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-tac-700">
        <p className="text-tac-300 text-xs text-center">Month 1 & 2 · 53 Posts</p>
      </div>
    </aside>
  )
}
