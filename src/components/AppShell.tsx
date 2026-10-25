import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp,
  FileQuestion, Highlighter, Home, Library, Map, Menu, NotebookPen,
  Search, ShieldCheck, X,
} from 'lucide-react'
import { chapters, getModuleForChapter, modules, totalPoints } from '../data'
import { useStudy } from '../store/StudyContext'
import type { ViewName } from '../types'
import { cx, percent } from '../utils'

interface AppShellProps {
  view: ViewName
  children: ReactNode
  onNavigate: (view: ViewName) => void
  onChapter: (chapterId: string, pointId?: string) => void
}

const navigation = [
  { id: 'home' as const, label: '学习首页', icon: Home },
  { id: 'course' as const, label: '学习路径', icon: Map },
  { id: 'practice' as const, label: '题库训练', icon: FileQuestion },
  { id: 'notes' as const, label: '笔记批注', icon: NotebookPen },
  { id: 'plan' as const, label: '复习计划', icon: CalendarDays },
]

export default function AppShell({ view, children, onNavigate, onChapter }: AppShellProps) {
  const { state, savedAt } = useStudy()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const currentModule = getModuleForChapter(state.lastChapterId)
  const [expanded, setExpanded] = useState(currentModule?.id ?? 'm1')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (currentModule) setExpanded(currentModule.id)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [currentModule])

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return []
    return chapters.flatMap((chapter) => chapter.points
      .filter((point) => `${chapter.title}${point.title}${point.summary}${point.memory}`.toLowerCase().includes(term))
      .map((point) => ({ chapter, point })))
      .slice(0, 9)
  }, [query])

  const progress = percent(state.completedPoints.length, totalPoints)

  const sidebar = (
    <div className="sidebar-inner">
      <button className="brand" onClick={() => onNavigate('home')} aria-label="返回学习首页">
        <span className="brand-mark"><BookOpen size={21} strokeWidth={1.8} /></span>
        <span><strong>药理航线</strong><small>PHARMACOLOGY ATLAS</small></span>
      </button>

      <button className="sidebar-search" onClick={() => setSearchOpen(true)}>
        <Search size={16} />
        <span>搜索药物与知识点</span>
        <kbd>⌘ K</kbd>
      </button>

      <nav className="main-nav" aria-label="主导航">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={cx('nav-item', view === item.id || (view === 'learn' && item.id === 'course') ? 'active' : '')}
            onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
          >
            <item.icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
            {item.id === 'notes' && state.marks.length > 0 && <em>{state.marks.length}</em>}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider"><span>课程板块</span><span>23 章</span></div>
      <div className="course-tree">
        {modules.map((module) => {
          const modulePoints = module.chapters.flatMap((chapter) => chapter.points)
          const complete = modulePoints.filter((point) => state.completedPoints.includes(point.id)).length
          const isOpen = expanded === module.id
          return (
            <div className="tree-module" key={module.id}>
              <button className="tree-module-button" onClick={() => setExpanded(isOpen ? '' : module.id)}>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className={`module-dot tone-${module.tone}`} />
                <span>{String(module.order).padStart(2, '0')} · {module.shortTitle}</span>
                <small>{complete}/{modulePoints.length}</small>
              </button>
              {isOpen && (
                <div className="tree-chapters">
                  {module.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      className={cx('tree-chapter', state.lastChapterId === chapter.id && view === 'learn' ? 'current' : '')}
                      onClick={() => { onChapter(chapter.id); setMobileOpen(false) }}
                    >
                      <span>{chapter.number.toString().padStart(2, '0')}</span>
                      <p>{chapter.title}</p>
                      {chapter.points.every((point) => state.completedPoints.includes(point.id)) && <Check size={13} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="sidebar-bottom">
        <div className="mini-progress-label"><span>总学习进度</span><strong>{progress}%</strong></div>
        <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
        <div className="local-status"><ShieldCheck size={14} /><span>{savedAt} · 仅存本机</span></div>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">{sidebar}</aside>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="关闭导航" />}
      <aside className={cx('mobile-sidebar', mobileOpen && 'open')}>
        <button className="mobile-close" onClick={() => setMobileOpen(false)}><X size={20} /></button>
        {sidebar}
      </aside>

      <div className="main-column">
        <header className="mobile-topbar">
          <button className="icon-button" onClick={() => setMobileOpen(true)} aria-label="打开导航"><Menu size={21} /></button>
          <span className="mobile-brand"><Library size={18} />药理航线</span>
          <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="搜索"><Search size={19} /></button>
        </header>
        <main className="main-content">{children}</main>
        <footer className="app-footer">
          <span>药理航线 · 依据个人课程资料构建</span>
          <span>仅用于课程复习，不构成诊疗或用药建议</span>
        </footer>
      </div>

      <nav className="mobile-bottom-nav" aria-label="移动端快捷导航">
        {navigation.slice(0, 4).map((item) => (
          <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}>
            <item.icon size={19} /><span>{item.label.replace('学习', '')}</span>
          </button>
        ))}
        <button className={view === 'plan' ? 'active' : ''} onClick={() => onNavigate('plan')}><CalendarDays size={19} /><span>计划</span></button>
      </nav>

      {searchOpen && (
        <div className="modal-layer search-layer" role="dialog" aria-modal="true" aria-label="搜索课程">
          <button className="modal-scrim" onClick={() => setSearchOpen(false)} aria-label="关闭搜索" />
          <section className="search-dialog">
            <div className="search-input-row">
              <Search size={21} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="试试“吗啡”“首过效应”或“微管”…" />
              <button onClick={() => setSearchOpen(false)}><X size={19} /></button>
            </div>
            <div className="search-results">
              {!query && (
                <div className="search-empty">
                  <CircleHelp size={24} />
                  <p>可搜索药物、机制、疾病与易错点</p>
                  <span>输入关键词后，点击结果直达对应知识点。</span>
                </div>
              )}
              {query && results.length === 0 && <div className="search-empty"><p>没有找到“{query}”</p><span>可以尝试更短的药名或机制关键词。</span></div>}
              {results.map(({ chapter, point }) => (
                <button key={point.id} onClick={() => { onChapter(chapter.id, point.id); setSearchOpen(false); setQuery('') }}>
                  <span className="search-result-icon"><Highlighter size={17} /></span>
                  <span><strong>{point.title}</strong><small>第 {chapter.number} 章 · {chapter.title}</small></span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
