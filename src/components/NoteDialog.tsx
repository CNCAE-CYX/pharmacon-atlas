import { useState } from 'react'
import { NotebookPen, X } from 'lucide-react'
import { useStudy } from '../store/StudyContext'
import type { MarkKind } from '../types'

export interface NoteDraft {
  pointId: string
  chapterId: string
  field: string
  text: string
  start?: number
  end?: number
}

export default function NoteDialog({ draft, onClose }: { draft: NoteDraft; onClose: () => void }) {
  const { addMark } = useStudy()
  const [note, setNote] = useState('')

  const save = () => {
    if (!note.trim()) return
    addMark({ ...draft, kind: 'note' as MarkKind, note: note.trim() })
    onClose()
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label="添加批注">
      <button className="modal-scrim" onClick={onClose} aria-label="关闭批注" />
      <section className="note-dialog">
        <header>
          <span className="dialog-icon"><NotebookPen size={20} /></span>
          <div><small>LOCAL ANNOTATION</small><h3>记录这条易错点</h3></div>
          <button className="icon-button" onClick={onClose}><X size={19} /></button>
        </header>
        {draft.text ? <blockquote>“{draft.text}”</blockquote> : <p className="free-note-label">为整个知识点写一条自由笔记，保存后会出现在本卡片与“笔记批注”页。</p>}
        <label htmlFor="study-note">批注内容</label>
        <textarea
          id="study-note"
          autoFocus
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="例如：我总是把紫杉醇写成抑制聚合，要记成“不让拆”…"
          rows={5}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') save()
          }}
        />
        <footer>
          <span>Ctrl / ⌘ + Enter 保存</span>
          <div><button className="button ghost" onClick={onClose}>取消</button><button className="button primary" disabled={!note.trim()} onClick={save}>保存批注</button></div>
        </footer>
      </section>
    </div>
  )
}
