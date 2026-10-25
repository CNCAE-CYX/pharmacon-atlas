/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { QuizRecord, StudyMark, StudyPlan, StudyState } from '../types'
import { dateKey } from '../utils'

const STORAGE_KEY = 'pharmacon-atlas-study-v1'

const initialState: StudyState = {
  completedPoints: [],
  marks: [],
  quiz: {},
  plan: { examDate: '', weeklyGoal: 3 },
  lastChapterId: 'ch01',
  activity: {},
}

function loadState(): StudyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const saved = JSON.parse(raw) as Partial<StudyState>
    return {
      ...initialState,
      ...saved,
      plan: { ...initialState.plan, ...saved.plan },
      completedPoints: saved.completedPoints ?? [],
      marks: saved.marks ?? [],
      quiz: saved.quiz ?? {},
      activity: saved.activity ?? {},
    }
  } catch {
    return initialState
  }
}

interface StudyContextValue {
  state: StudyState
  savedAt: string
  togglePoint: (pointId: string) => void
  addMark: (mark: Omit<StudyMark, 'id' | 'createdAt' | 'updatedAt'>) => StudyMark
  updateMark: (id: string, patch: Partial<StudyMark>) => void
  deleteMark: (id: string) => void
  setQuizRecord: (questionId: string, record: Partial<QuizRecord>) => void
  resetModuleQuiz: (questionIds: string[]) => void
  updatePlan: (patch: Partial<StudyPlan>) => void
  setLastChapter: (chapterId: string) => void
}

const StudyContext = createContext<StudyContextValue | null>(null)

function nextActivity(state: StudyState) {
  const key = dateKey()
  return { ...state.activity, [key]: (state.activity[key] ?? 0) + 1 }
}

function canUseLocalStorage() {
  try {
    const key = 'pharmacon-storage-check'
    localStorage.setItem(key, '1')
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(loadState)
  const [canPersist] = useState(canUseLocalStorage)
  const savedAt = canPersist ? '已自动保存' : '当前环境保存受限'

  useEffect(() => {
    if (!canPersist) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // The app remains usable in memory when a browser restricts file:// storage.
    }
  }, [state, canPersist])

  const value = useMemo<StudyContextValue>(() => ({
    state,
    savedAt,
    togglePoint(pointId) {
      setState((previous) => {
        const exists = previous.completedPoints.includes(pointId)
        return {
          ...previous,
          completedPoints: exists
            ? previous.completedPoints.filter((id) => id !== pointId)
            : [...previous.completedPoints, pointId],
          activity: exists ? previous.activity : nextActivity(previous),
        }
      })
    },
    addMark(mark) {
      const now = new Date().toISOString()
      const full: StudyMark = {
        ...mark,
        id: `mark-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      }
      setState((previous) => ({
        ...previous,
        marks: [full, ...previous.marks],
        activity: nextActivity(previous),
      }))
      return full
    },
    updateMark(id, patch) {
      setState((previous) => ({
        ...previous,
        marks: previous.marks.map((mark) => mark.id === id
          ? { ...mark, ...patch, updatedAt: new Date().toISOString() }
          : mark),
      }))
    },
    deleteMark(id) {
      setState((previous) => ({ ...previous, marks: previous.marks.filter((mark) => mark.id !== id) }))
    },
    setQuizRecord(questionId, record) {
      setState((previous) => {
        const current = previous.quiz[questionId]
        const next: QuizRecord = {
          answer: record.answer ?? current?.answer ?? '',
          revealed: record.revealed ?? current?.revealed ?? false,
          result: record.result === undefined ? current?.result : record.result,
          updatedAt: new Date().toISOString(),
        }
        const wasAnswered = current?.revealed ?? false
        return {
          ...previous,
          quiz: { ...previous.quiz, [questionId]: next },
          activity: !wasAnswered && next.revealed ? nextActivity(previous) : previous.activity,
        }
      })
    },
    resetModuleQuiz(questionIds) {
      setState((previous) => {
        const quiz = { ...previous.quiz }
        questionIds.forEach((id) => delete quiz[id])
        return { ...previous, quiz }
      })
    },
    updatePlan(patch) {
      setState((previous) => ({ ...previous, plan: { ...previous.plan, ...patch } }))
    },
    setLastChapter(chapterId) {
      setState((previous) => previous.lastChapterId === chapterId ? previous : { ...previous, lastChapterId: chapterId })
    },
  }), [state, savedAt])

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) throw new Error('useStudy must be used within StudyProvider')
  return context
}
