import { useMemo, useState } from 'react'
import { ArrowRight, Download, FileText, Highlighter, NotebookPen, Search, Trash2, Underline } from 'lucide-react'
import { chapterMap, pointMap } from '../data'
import { useStudy } from '../store/StudyContext'
import type { MarkKind } from '../types'
import { cx, dateKey, downloadJson } from '../utils'

type NoteFilter = 'all' | MarkKind

export default function NotesPage({ onChapter, onCourse }: { onChapter: (chapterId: string, pointId?: string) => void; onCourse: () => void }) {
  const { state, updateMark, deleteMark } = useStudy()
  const [filter, setFilter] = useState<NoteFilter>('all')
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState('')

  const marks = useMemo(() => state.marks.filter((mark) => {
    if (filter !== 'all' && mark.kind !== filter) return false
    const point = pointMap.get(mark.pointId)
    const haystack = `${mark.text}${mark.note}${point?.title ?? ''}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  }), [state.marks, filter, query])

  const counts = {
    all: state.marks.length,
    highlight: state.marks.filter((mark) => mark.kind === 'highlight').length,
    underline: state.marks.filter((mark) => mark.kind === 'underline').length,
    note: state.marks.filter((mark) => mark.kind === 'note').length,
  }

  return (
    <div className="page notes-page">
      <header className="page-title-row">
        <div><span className="section-kicker">MY MARGIN · 笔记批注</span><h1>把易错点，留在对应的位置。</h1><p>重点、下划线与自由笔记统一收在这里；点击任何一条都能回到原知识点。</p></div>
        <button className="button secondary" disabled={!state.marks.length} onClick={() => downloadJson(`药理学笔记-${dateKey()}.json`, state.marks)}><Download size={16} />导出笔记</button>
      </header>

      <div className="notes-stats">
        <div><span className="note-stat-icon all"><NotebookPen size={19} /></span><strong>{counts.all}</strong><small>全部记录</small></div>
        <div><span className="note-stat-icon highlight"><Highlighter size={19} /></span><strong>{counts.highlight}</strong><small>重点标记</small></div>
        <div><span className="note-stat-icon underline"><Underline size={19} /></span><strong>{counts.underline}</strong><small>下划线</small></div>
        <div><span className="note-stat-icon note"><FileText size={19} /></span><strong>{counts.note}</strong><small>文字批注</small></div>
      </div>

      <div className="notes-toolbar">
        <div>{(['all', 'highlight', 'underline', 'note'] as NoteFilter[]).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{({ all: '全部', highlight: '重点', underline: '下划线', note: '批注' })[item]}<span>{counts[item]}</span></button>)}</div>
        <label className="inline-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索笔记内容…" /></label>
      </div>

      {marks.length > 0 ? (
        <div className="notes-list">
          {marks.map((mark) => {
            const point = pointMap.get(mark.pointId)
            const chapter = chapterMap.get(mark.chapterId)
            return (
              <article className={cx('note-card', `note-kind-${mark.kind}`)} key={mark.id}>
                <header>
                  <span className={`note-kind-badge ${mark.kind}`}>{mark.kind === 'highlight' ? <Highlighter size={14} /> : mark.kind === 'underline' ? <Underline size={14} /> : <NotebookPen size={14} />}{mark.kind === 'highlight' ? '重点标记' : mark.kind === 'underline' ? '下划线' : '文字批注'}</span>
                  <span>{new Date(mark.updatedAt).toLocaleDateString('zh-CN')}</span>
                </header>
                <button className="note-location" onClick={() => onChapter(mark.chapterId, mark.pointId)}>{chapter?.title}<span>/</span>{point?.title}<ArrowRight size={14} /></button>
                {mark.text && <blockquote className={cx(mark.kind === 'highlight' && 'quoted-highlight', mark.kind === 'underline' && 'quoted-underline')}>{mark.text}</blockquote>}
                <label className="note-edit-label">{mark.note ? '我的批注' : '补充一条批注（自动保存）'}</label>
                <textarea value={mark.note} onChange={(event) => updateMark(mark.id, { note: event.target.value })} placeholder={mark.kind === 'note' ? '写下你的理解与易错点…' : '可选：记录为什么这里容易错…'} rows={mark.note ? 3 : 2} />
                <footer>
                  <span>保存在本机浏览器</span>
                  {confirmDelete === mark.id ? <div className="delete-confirm"><span>确定删除？</span><button onClick={() => { deleteMark(mark.id); setConfirmDelete('') }}>确定</button><button onClick={() => setConfirmDelete('')}>取消</button></div> : <button className="delete-note" onClick={() => setConfirmDelete(mark.id)}><Trash2 size={14} />删除</button>}
                </footer>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="empty-state notes-empty"><NotebookPen size={34} /><h3>{state.marks.length ? '没有匹配的记录' : '还没有重点或批注'}</h3><p>{state.marks.length ? '换个关键词或筛选条件试试。' : '进入任一章节，选中正文即可标记重点、下划线或写下批注。'}</p>{state.marks.length ? <button className="button secondary" onClick={() => { setQuery(''); setFilter('all') }}>清除筛选</button> : <button className="button primary" onClick={onCourse}>去学习第一条知识点<ArrowRight size={16} /></button>}</div>
      )}
    </div>
  )
}
