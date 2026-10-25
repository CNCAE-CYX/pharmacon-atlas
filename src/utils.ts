import type { Question } from './types'

export function asset(path: string) {
  const embedded = (window as unknown as { __PHARMACON_ASSETS__?: Record<string, string> }).__PHARMACON_ASSETS__
  if (embedded?.[path]) return embedded[path]
  const base = import.meta.env.BASE_URL || '/'
  const separator = path.includes('?') ? '&' : '?'
  return `${base}${path}${separator}v=20261025-2`
}

export function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ')
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function percent(value: number, total: number) {
  return total === 0 ? 0 : Math.round((value / total) * 100)
}

export function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function normalizeAnswer(value: string) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s，。；、,.;:：；!！?？()（）【】\-—_]/g, '')
    .replaceAll('[', '')
    .replaceAll(']', '')
    .replace(/^(答案)?[:：]?/, '')
}

export function judgeFill(question: Question, input: string) {
  const normalized = normalizeAnswer(input)
  if (!normalized) return false
  if (question.accepted?.some((answer) => normalizeAnswer(answer) === normalized)) return true
  if (question.keywords?.length) {
    return question.keywords.every((keyword) => normalized.includes(normalizeAnswer(keyword)))
  }
  return false
}

export function questionTypeLabel(type: Question['type']) {
  return { choice: '单项选择', fill: '填空题', term: '名词解释', short: '简答题' }[type]
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function formatShortDate(value: string) {
  if (!value) return ''
  const date = new Date(`${value}T12:00:00`)
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
}
