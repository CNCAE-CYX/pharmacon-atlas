import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2,
  ChevronRight, Circle, Clock3, FileQuestion, Highlighter, Lightbulb,
  ListChecks, NotebookPen, Quote, ScanText, Trash2, Underline,
} from 'lucide-react'
import HighlightText from '../components/HighlightText'
import NoteDialog from '../components/NoteDialog'
import type { NoteDraft } from '../components/NoteDialog'
import SourceModal from '../components/SourceModal'
import { chapterMap, chapters, getModuleForChapter, getQuestionsForChapter } from '../data'
import { useStudy } from '../store/StudyContext'
import type { KnowledgePoint, MarkKind } from '../types'
import { asset, clamp, cx, percent } from '../utils'

interface LearnPageProps {
  chapterId: string
  focusPointId?: string
  onChapter: (chapterId: string, pointId?: string) => void
  onPractice: (moduleId: string) => void
}

interface PendingSelection extends NoteDraft {
  x: number
  y: number
}

export default function LearnPage({ chapterId, focusPointId, onChapter, onPractice }: LearnPageProps) {
  const chapter = chapterMap.get(chapterId) ?? chapters[0]
  const module = getModuleForChapter(chapter.id)!
  const { state, togglePoint, addMark, setLastChapter, deleteMark } = useStudy()
  const [sourcePoint, setSourcePoint] = useState<KnowledgePoint | null>(null)
  const [noteDraft, setNoteDraft] = useState<NoteDraft | null>(null)
  const [selection, setSelection] = useState<PendingSelection | null>(null)
  const chapterQuestions = getQuestionsForChapter(chapter.id)
  const completed = chapter.points.filter((point) => state.completedPoints.includes(point.id)).length
  const chapterPercent = percent(completed, chapter.points.length)
  const chapterIndex = chapters.findIndex((item) => item.id === chapter.id)
  const previous = chapters[chapterIndex - 1]
  const next = chapters[chapterIndex + 1]

  useEffect(() => {
    setLastChapter(chapter.id)
    const timer = window.setTimeout(() => {
      if (focusPointId) {
        document.getElementById(focusPointId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }, 80)
    return () => window.clearTimeout(timer)
    // Progress updates must not restart navigation or move the reader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id, focusPointId])

  const closeSource = () => setSourcePoint(null)

  const generalNotes = useMemo(() => state.marks.filter((mark) => mark.chapterId === chapter.id && mark.field === 'general'), [state.marks, chapter.id])

  function scrollToPoint(pointId: string) {
    document.getElementById(pointId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleTextSelection() {
    window.setTimeout(() => {
      const current = window.getSelection()
      if (!current || current.isCollapsed || current.rangeCount === 0) return
      const range = current.getRangeAt(0)
      const getElement = (node: Node) => node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement
      const startElement = getElement(range.startContainer)?.closest('[data-text-key]')
      const endElement = getElement(range.endContainer)?.closest('[data-text-key]')
      if (!startElement || startElement !== endElement) return
      const text = range.toString()
      if (text.trim().length < 2) return
      const pointId = startElement.getAttribute('data-point-id')
      const field = startElement.getAttribute('data-field')
      if (!pointId || !field || !chapter.points.some((point) => point.id === pointId)) return
      const before = document.createRange()
      before.selectNodeContents(startElement)
      before.setEnd(range.startContainer, range.startOffset)
      const start = before.toString().length
      const rect = range.getBoundingClientRect()
      setSelection({
        pointId,
        chapterId: chapter.id,
        field,
        text,
        start,
        end: start + text.length,
        x: clamp(rect.left + rect.width / 2 - 130, 12, window.innerWidth - 272),
        y: Math.max(74, rect.top - 58),
      })
    }, 0)
  }

  function makeMark(kind: MarkKind) {
    if (!selection) return
    if (kind === 'note') {
      setNoteDraft({ pointId: selection.pointId, chapterId: selection.chapterId, field: selection.field, text: selection.text, start: selection.start, end: selection.end })
    } else {
      addMark({ pointId: selection.pointId, chapterId: selection.chapterId, field: selection.field, text: selection.text, start: selection.start, end: selection.end, kind, note: '' })
    }
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }

  return (
    <div className="page learn-page" onMouseUp={handleTextSelection}>
      <div className="learn-breadcrumb">
        <button onClick={() => onChapter(chapter.id)}><span>学习路径</span></button><ChevronRight size={14} /><span>{module.title}</span><ChevronRight size={14} /><strong>第 {chapter.number} 章</strong>
      </div>

      <header className="learn-header">
        <div className="learn-title-block">
          <div className="learn-chapter-number"><span>CHAPTER</span><strong>{String(chapter.number).padStart(2, '0')}</strong></div>
          <div><span className={`module-pill tone-text-${module.tone}`}>{module.title}</span><h1>{chapter.title}</h1><p>{chapter.intro}</p></div>
        </div>
        <div className="learn-header-progress">
          <strong>{chapterPercent}%</strong><span>本章完成</span><div><i style={{ width: `${chapterPercent}%` }} /></div><small>{completed}/{chapter.points.length} 个知识点</small>
        </div>
      </header>

      <div className="learning-objectives">
        <span><ListChecks size={17} />本章目标</span>
        <div>{chapter.outcomes.map((outcome) => <em key={outcome}><Check size={13} />{outcome}</em>)}</div>
        <small><Clock3 size={14} />建议 {chapter.duration} 分钟</small>
      </div>

      <div className="learn-layout">
        <div className="knowledge-stream">
          <div className="selection-guide"><Highlighter size={16} /><span>试试选中任意正文：即可添加重点、下划线或批注，记录会保存在本机。</span></div>
          {chapter.points.map((point, index) => {
            const isComplete = state.completedPoints.includes(point.id)
            const noteCount = state.marks.filter((mark) => mark.pointId === point.id).length
            const firstPage = point.sourcePages[0]
            const pointNotes = generalNotes.filter((mark) => mark.pointId === point.id)
            return (
              <article className={cx('knowledge-card', isComplete && 'completed')} id={point.id} key={point.id}>
                <header className="knowledge-header">
                  <div className="knowledge-sequence"><span>{String(index + 1).padStart(2, '0')}</span><i /></div>
                  <div className="knowledge-title"><span className="level-badge">{point.level}</span><h2>{point.title}</h2></div>
                  <button className={cx('complete-toggle', isComplete && 'done')} onClick={() => togglePoint(point.id)} aria-label={isComplete ? '标记为未完成' : '标记为已完成'}>
                    {isComplete ? <CheckCircle2 size={19} /> : <Circle size={19} />}<span>{isComplete ? '已完成' : '待学习'}</span>
                  </button>
                </header>

                <div className="knowledge-body">
                  <HighlightText pointId={point.id} field="summary" text={point.summary} className="knowledge-summary" />

                  <div className="step-learning">
                    <h3><span>STEP BY STEP</span>循序渐进</h3>
                    {point.steps.map((step, stepIndex) => (
                      <div className="learning-step" key={step}>
                        <span>{stepIndex + 1}</span>
                        <HighlightText pointId={point.id} field={`step-${stepIndex}`} text={step} />
                      </div>
                    ))}
                  </div>

                  <div className="memory-box">
                    <Lightbulb size={19} />
                    <div><strong>这样记</strong><HighlightText pointId={point.id} field="memory" text={point.memory} /></div>
                  </div>
                  <div className="caution-box">
                    <AlertTriangle size={18} />
                    <div><strong>易错提醒</strong><HighlightText pointId={point.id} field="caution" text={point.caution} /></div>
                  </div>

                  {pointNotes.length > 0 && (
                    <div className="point-notes">
                      {pointNotes.map((mark) => (
                        <div key={mark.id}><NotebookPen size={15} /><p>{mark.note}</p><button onClick={() => deleteMark(mark.id)} aria-label="删除这条笔记"><Trash2 size={14} /></button></div>
                      ))}
                    </div>
                  )}

                  <div className="source-preview-row">
                    <button className="source-thumbnail" onClick={() => setSourcePoint(point)}>
                      <img src={asset(`sources/${chapter.id}/p${String(firstPage).padStart(3, '0')}.webp`)} alt={`${point.title}原课件图解`} loading="lazy" />
                      <span><ScanText size={15} />课件图解</span>
                    </button>
                    <div><strong>不只看提炼，也能回到原页。</strong><p>本知识点关联 {point.sourcePages.length} 个课件页面，可查看原始图表、板书与上下文。</p><button className="source-link" onClick={() => setSourcePoint(point)}><BookOpen size={16} />知识溯源<ArrowRight size={15} /></button></div>
                  </div>
                </div>

                <footer className="knowledge-footer">
                  <div><button onClick={() => setNoteDraft({ pointId: point.id, chapterId: chapter.id, field: 'general', text: '' })}><NotebookPen size={16} />记笔记{noteCount > 0 && <em>{noteCount}</em>}</button><span>选择正文可精确标记</span></div>
                  <button className={cx('button', isComplete ? 'completed-button' : 'secondary')} onClick={() => togglePoint(point.id)}>{isComplete ? <><Check size={16} />已掌握，点击撤销</> : <><CheckCircle2 size={16} />标记为已掌握</>}</button>
                </footer>
              </article>
            )
          })}

          <section className="chapter-quiz-cta">
            <div><span className="section-kicker">ACTIVE RECALL</span><h2>学完这一章，用主动回忆收尾。</h2><p>本章关联 {chapterQuestions.length} 道题；进入「{module.shortTitle}」板块，可混合练习真题与 Kimi 补充题。</p></div>
            <button className="button primary large" onClick={() => onPractice(module.id)}><FileQuestion size={18} />进入板块答题<ArrowRight size={17} /></button>
          </section>

          <nav className="chapter-pagination">
            {previous ? <button onClick={() => onChapter(previous.id)}><ArrowLeft size={18} /><span><small>上一章</small><strong>{previous.title}</strong></span></button> : <span />}
            {next && <button onClick={() => onChapter(next.id)}><span><small>下一章</small><strong>{next.title}</strong></span><ArrowRight size={18} /></button>}
          </nav>
        </div>

        <aside className="chapter-toc">
          <div className="toc-card">
            <span className="section-kicker">IN THIS CHAPTER</span><h3>本章学习清单</h3>
            <div className="toc-overall"><div><i style={{ width: `${chapterPercent}%` }} /></div><span>{completed}/{chapter.points.length}</span></div>
            <div className="toc-points">
              {chapter.points.map((point, index) => (
                <button key={point.id} onClick={() => scrollToPoint(point.id)}>
                  <span>{state.completedPoints.includes(point.id) ? <Check size={13} /> : String(index + 1).padStart(2, '0')}</span><p>{point.title}</p>
                </button>
              ))}
            </div>
            <button className="button secondary full" onClick={() => onPractice(module.id)}><FileQuestion size={16} />本章相关练习<ChevronRight size={15} /></button>
          </div>
          <div className="toc-source-card">
            <Quote size={19} /><p>原课件：</p><strong>{chapter.sourceFile}</strong><span>每个知识点的“知识溯源”均可查看对应原页。</span>
          </div>
        </aside>
      </div>

      {selection && (
        <div className="selection-toolbar" style={{ left: selection.x, top: selection.y }} role="toolbar" aria-label="文本标记工具" onMouseDown={(event) => event.preventDefault()}>
          <button onClick={() => makeMark('highlight')}><Highlighter size={16} /><span>重点</span></button>
          <button onClick={() => makeMark('underline')}><Underline size={16} /><span>下划线</span></button>
          <i />
          <button onClick={() => makeMark('note')}><NotebookPen size={16} /><span>批注</span></button>
        </div>
      )}
      {sourcePoint && <SourceModal chapter={chapter} point={sourcePoint} onClose={closeSource} />}
      {noteDraft && <NoteDialog draft={noteDraft} onClose={() => setNoteDraft(null)} />}
    </div>
  )
}
