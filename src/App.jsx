import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import WeeklyDashboard from './components/dashboard/WeeklyDashboard.jsx'
import ContentPipeline from './components/pipeline/ContentPipeline.jsx'
import CalendarView from './components/calendar/CalendarView.jsx'
import AnalyticsView from './components/pipeline/AnalyticsView.jsx'
import GrowthDashboard from './components/growth/GrowthDashboard.jsx'
import IdeaLog from './components/ideas/IdeaLog.jsx'
import ViralWatch from './components/viral/ViralWatch.jsx'
import TeamRoadmap from './components/roadmap/TeamRoadmap.jsx'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-tac-900">
      <Sidebar activeView={activeView} onSelect={setActiveView} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <ErrorBoundary key={activeView}>
          {activeView === 'dashboard'  && <WeeklyDashboard />}
          {activeView === 'pipeline'   && <ContentPipeline />}
          {activeView === 'schedule'   && <CalendarView />}
          {activeView === 'analytics'  && <AnalyticsView />}
          {activeView === 'growth'     && <GrowthDashboard />}
          {activeView === 'ideas'      && <IdeaLog />}
          {activeView === 'viral'      && <ViralWatch />}
          {activeView === 'roadmap'    && <TeamRoadmap />}
        </ErrorBoundary>
      </main>
    </div>
  )
}
