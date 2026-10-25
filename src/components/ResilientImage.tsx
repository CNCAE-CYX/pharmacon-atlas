import { useState } from 'react'
import { ImageOff, RotateCcw } from 'lucide-react'

interface ResilientImageProps {
  src: string
  alt: string
  className?: string
}

export default function ResilientImage({ src, alt, className }: ResilientImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)
  const url = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src

  if (status === 'error') {
    return (
      <div className="source-image-error" role="alert">
        <ImageOff size={28} />
        <strong>课件图片暂时未能加载</strong>
        <span>{alt}</span>
        <button onClick={() => { setStatus('loading'); setAttempt((value) => value + 1) }}><RotateCcw size={15} />重新加载</button>
      </div>
    )
  }

  return (
    <>
      {status === 'loading' && <div className="source-image-loading"><span />正在加载原课件…</div>}
      <img
        className={className}
        src={url}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </>
  )
}
