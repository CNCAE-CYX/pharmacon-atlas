import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, FileText, Image, X, ZoomIn, ZoomOut } from 'lucide-react'
import { sourceMap } from '../data/sources'
import ResilientImage from './ResilientImage'
import type { Chapter, KnowledgePoint } from '../types'
import { asset, cx } from '../utils'

interface SourceModalProps {
  chapter: Chapter
  point: KnowledgePoint
  onClose: () => void
}

export default function SourceModal({ chapter, point, onClose }: SourceModalProps) {
  const source = sourceMap[chapter.id]
  const [pageNumber, setPageNumber] = useState(point.sourcePages[0])
  const [showText, setShowText] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', listener)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', listener)
    }
  }, [onClose])

  const pages = useMemo(() => source?.pages.filter((page) => point.sourcePages.includes(page.page)) ?? [], [source, point.sourcePages])
  const index = Math.max(0, pages.findIndex((page) => page.page === pageNumber))
  const current = pages[index] ?? pages[0]

  return (
    <div className="modal-layer source-layer" role="dialog" aria-modal="true" aria-label={`知识溯源：${point.title}`}>
      <button className="modal-scrim" onClick={onClose} aria-label="关闭知识溯源" />
      <section className="source-dialog">
        <header className="source-header">
          <div className="source-title-icon"><BookOpen size={22} /></div>
          <div>
            <small>知识溯源 · SOURCE TRACE</small>
            <h2>{point.title}</h2>
            <p>{source?.originalFile ?? chapter.sourceFile}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭"><X size={21} /></button>
        </header>

        <div className="source-body">
          <div className="source-viewer">
            {!source && <div className="source-loading"><FileText size={28} /><span>未找到本章的溯源数据</span></div>}
            {current && (
              <>
                <div className={cx('source-image-scroll', zoomed && 'zoomed')}>
                  <ResilientImage key={current.image} className="source-page-image" src={asset(current.image)} alt={`${chapter.title}原课件第${current.page}页`} />
                </div>
                <div className="source-view-tools">
                  <span><Image size={14} />原始课件页面</span>
                  <div>
                    <button onClick={() => setZoomed(!zoomed)}>{zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}{zoomed ? '适应窗口' : '放大阅读'}</button>
                    <a href={asset(current.image)} target="_blank" rel="noreferrer"><ExternalLink size={15} />新窗口打开</a>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className={cx('source-side', showText && 'show-text')}>
            <div className="source-meta">
              <span>出现位置</span>
              <strong>第 {current?.page ?? pageNumber} 页</strong>
              <p>{source?.sourceType === 'pdf' ? 'PDF 原页渲染' : 'PowerPoint 原始版式转换'} · 共 {source?.pageCount ?? '—'} 页</p>
            </div>
            <div className="source-page-list">
              <span>本知识点关联页</span>
              <div>
                {point.sourcePages.map((page) => (
                  <button key={page} className={current?.page === page ? 'active' : ''} onClick={() => setPageNumber(page)}>{page}</button>
                ))}
              </div>
            </div>
            <button className="source-text-toggle" onClick={() => setShowText(!showText)}><FileText size={16} />{showText ? '隐藏提取文字' : '查看提取文字'}</button>
            {showText && <div className="source-extracted-text">{current?.text || '本页以图片或板书为主，未提取到文字。请查看左侧原页。'}</div>}
            <div className="source-note">
              <strong>如何使用溯源</strong>
              <p>先对照原页找到自己略过的图、表或板书，再回到知识卡片补充下划线或批注。</p>
            </div>
          </aside>
        </div>

        <footer className="source-footer">
          <span>第 {index + 1} / {Math.max(pages.length, 1)} 个关联页面</span>
          <div>
            <button className="button ghost" disabled={index <= 0} onClick={() => setPageNumber(pages[index - 1].page)}><ChevronLeft size={17} />上一页</button>
            <button className="button secondary" disabled={index >= pages.length - 1} onClick={() => setPageNumber(pages[index + 1].page)}>下一页<ChevronRight size={17} /></button>
          </div>
        </footer>
      </section>
    </div>
  )
}
