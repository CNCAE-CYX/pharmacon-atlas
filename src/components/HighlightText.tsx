import { useStudy } from '../store/StudyContext'
import { cx } from '../utils'

interface HighlightTextProps {
  pointId: string
  field: string
  text: string
  className?: string
}

export default function HighlightText({ pointId, field, text, className }: HighlightTextProps) {
  const { state } = useStudy()
  const marks = state.marks
    .filter((mark) => mark.pointId === pointId && mark.field === field && mark.start !== undefined && mark.end !== undefined)
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0))

  const segments = []
  let cursor = 0
  for (const mark of marks) {
    const start = mark.start ?? 0
    const end = mark.end ?? start
    if (start < cursor || start >= text.length || end <= start) continue
    if (start > cursor) segments.push(<span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>)
    segments.push(
      <mark
        key={mark.id}
        className={cx('study-mark', `mark-${mark.kind}`, mark.note && 'has-note')}
        title={mark.note || (mark.kind === 'underline' ? '下划线标记' : '重点标记')}
      >
        {text.slice(start, Math.min(end, text.length))}
      </mark>,
    )
    cursor = Math.min(end, text.length)
  }
  if (cursor < text.length) segments.push(<span key={`plain-${cursor}`}>{text.slice(cursor)}</span>)

  return (
    <div
      className={cx('highlight-text', className)}
      data-text-key={`${pointId}:${field}`}
      data-point-id={pointId}
      data-field={field}
    >
      {segments}
    </div>
  )
}
