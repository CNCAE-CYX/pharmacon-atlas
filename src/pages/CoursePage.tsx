import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Check, Clock3, FileText, Route, Search } from 'lucide-react'
import { modules, totalPoints } from '../data'
import { useStudy } from '../store/StudyContext'
import { asset, percent } from '../utils'

export default function CoursePage({ onChapter }: { onChapter: (chapterId: string, pointId?: string) => void }) {
  const { state } = useStudy()
  const [query, setQuery] = useState('')
  const [onlyIncomplete, setOnlyIncomplete] = useState(false)

  const visibleModules = useMemo(() => {
    const term = query.trim().toLowerCase()
    return modules.map((module) => ({
      ...module,
      chapters: module.chapters.filter((chapter) => {
        const matches = !term || `${chapter.title}${chapter.intro}${chapter.points.map((point) => point.title).join('')}`.toLowerCase().includes(term)
        const incomplete = chapter.points.some((point) => !state.completedPoints.includes(point.id))
        return matches && (!onlyIncomplete || incomplete)
      }),
    })).filter((module) => module.chapters.length > 0)
  }, [query, onlyIncomplete, state.completedPoints])

  return (
    <div className="page course-page">
      <header className="page-title-row">
        <div><span className="section-kicker">LEARNING PATH · 学习路径</span><h1>沿着课程进度，一块一块攻克。</h1><p>每章先看学习目标，再按编号完成知识点；完成后进入对应板块题库。</p></div>
        <div className="course-total-badge"><Route size={22} /><span><strong>{state.completedPoints.length} / {totalPoints}</strong>知识点已完成</span></div>
      </header>

      <div className="schedule-note">
        <span className="schedule-note-icon"><BookOpen size={20} /></span>
        <div><strong>教学顺序不是简单按文件编号排列</strong><p>依据《1 药理学总论-第一章和第五章绪论.pdf》第 2 页课程设置，网站按“总论 → 传出 → 中枢 → 心血管 → 激素 → 血尿 → 化疗”展开；章号仍保留原课件编号，方便回查。</p></div>
      </div>

      <div className="course-toolbar">
        <label className="inline-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索章节或知识点…" /></label>
        <label className="check-filter"><input type="checkbox" checked={onlyIncomplete} onChange={(event) => setOnlyIncomplete(event.target.checked)} /><span>只看未完成章节</span></label>
        <span className="course-result-count">{visibleModules.reduce((sum, module) => sum + module.chapters.length, 0)} 章</span>
      </div>

      <div className="course-modules">
        {visibleModules.map((module) => {
          const modulePoints = module.chapters.flatMap((chapter) => chapter.points)
          const originalModule = modules.find((item) => item.id === module.id)!
          const allModulePoints = originalModule.chapters.flatMap((chapter) => chapter.points)
          const done = allModulePoints.filter((point) => state.completedPoints.includes(point.id)).length
          return (
            <section className="course-module" key={module.id}>
              <header className="course-module-header">
                <span className={`course-module-number tone-bg-${module.tone}`}>{String(module.order).padStart(2, '0')}</span>
                <div><h2>{module.title}</h2><p>{module.subtitle}</p></div>
                <div className="module-header-progress"><span>{done}/{allModulePoints.length} 知识点</span><div><i style={{ width: `${percent(done, allModulePoints.length)}%` }} /></div></div>
              </header>
              <div className="chapter-grid">
                {module.chapters.map((chapter) => {
                  const complete = chapter.points.filter((point) => state.completedPoints.includes(point.id)).length
                  const chapterPercent = percent(complete, chapter.points.length)
                  const firstPage = chapter.points[0].sourcePages[0]
                  return (
                    <button className="chapter-card" key={chapter.id} onClick={() => onChapter(chapter.id)}>
                      <div className="chapter-cover">
                        <img src={asset(`sources/${chapter.id}/p${String(firstPage).padStart(3, '0')}.webp`)} alt={`${chapter.title}课件预览`} loading="lazy" />
                        <span><FileText size={13} />原课件</span>
                        {chapterPercent === 100 && <i className="chapter-done"><Check size={17} /></i>}
                      </div>
                      <div className="chapter-card-body">
                        <small>CHAPTER {String(chapter.number).padStart(2, '0')}</small>
                        <h3>{chapter.title}</h3>
                        <p>{chapter.intro}</p>
                        <div className="chapter-card-meta"><span><Clock3 size={14} />{chapter.duration} 分钟</span><span>{chapter.points.length} 个知识点</span></div>
                        <div className="chapter-progress"><div><i style={{ width: `${chapterPercent}%` }} /></div><span>{chapterPercent}%</span></div>
                        <div className="chapter-card-link">{chapterPercent ? '继续本章' : '开始学习'}<ArrowRight size={16} /></div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {modulePoints.length === 0 && null}
            </section>
          )
        })}
      </div>

      {visibleModules.length === 0 && <div className="empty-state"><Search size={30} /><h3>没有匹配的章节</h3><p>试试更短的关键词，或关闭“只看未完成”。</p><button className="button secondary" onClick={() => { setQuery(''); setOnlyIncomplete(false) }}>清除筛选</button></div>}
    </div>
  )
}
