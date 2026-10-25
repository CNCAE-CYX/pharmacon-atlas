import { useState } from 'react'
import AppShell from './components/AppShell'
import CoursePage from './pages/CoursePage'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import NotesPage from './pages/NotesPage'
import PlanPage from './pages/PlanPage'
import PracticePage from './pages/PracticePage'
import { StudyProvider, useStudy } from './store/StudyContext'
import type { ViewName } from './types'
import './App.css'

function AppContent() {
  const { state, setLastChapter } = useStudy()
  const [view, setView] = useState<ViewName>('home')
  const [chapterId, setChapterId] = useState(state.lastChapterId)
  const [focusPointId, setFocusPointId] = useState<string>()
  const [practiceModule, setPracticeModule] = useState('m1')

  function navigate(next: ViewName) {
    setView(next)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function openChapter(id: string, pointId?: string) {
    setChapterId(id)
    setFocusPointId(pointId)
    setLastChapter(id)
    setView('learn')
  }

  function openPractice(moduleId: string) {
    setPracticeModule(moduleId)
    setView('practice')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <AppShell view={view} onNavigate={navigate} onChapter={openChapter}>
      {view === 'home' && <HomePage onChapter={openChapter} onNavigate={navigate} onPractice={openPractice} />}
      {view === 'course' && <CoursePage onChapter={openChapter} />}
      {view === 'learn' && <LearnPage chapterId={chapterId} focusPointId={focusPointId} onChapter={openChapter} onPractice={openPractice} />}
      {view === 'practice' && <PracticePage moduleId={practiceModule} onModuleChange={setPracticeModule} onChapter={openChapter} />}
      {view === 'notes' && <NotesPage onChapter={openChapter} onCourse={() => navigate('course')} />}
      {view === 'plan' && <PlanPage onChapter={openChapter} onPractice={openPractice} />}
    </AppShell>
  )
}

export default function App() {
  return <StudyProvider><AppContent /></StudyProvider>
}
