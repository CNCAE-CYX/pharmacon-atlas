export type ViewName = 'home' | 'course' | 'learn' | 'practice' | 'notes' | 'plan'

export interface KnowledgePoint {
  id: string
  title: string
  level: string
  summary: string
  steps: string[]
  memory: string
  caution: string
  sourcePages: number[]
}

export interface Chapter {
  id: string
  number: number
  title: string
  sourceFile: string
  duration: number
  intro: string
  outcomes: string[]
  points: KnowledgePoint[]
}

export interface Module {
  id: string
  order: number
  title: string
  shortTitle: string
  subtitle: string
  tone: string
  chapters: Chapter[]
}

export type QuestionType = 'choice' | 'fill' | 'term' | 'short'
export type QuestionOrigin = 'past' | 'supplement'

export interface Question {
  id: string
  type: QuestionType
  origin: QuestionOrigin
  source: string
  chapterId: string
  pointId: string
  prompt: string
  options?: string[]
  answer: string
  accepted?: string[]
  keywords?: string[]
  explanation?: string
  rubric?: string[]
}

export type MarkKind = 'highlight' | 'underline' | 'note'

export interface StudyMark {
  id: string
  pointId: string
  chapterId: string
  field: string
  text: string
  start?: number
  end?: number
  kind: MarkKind
  note: string
  createdAt: string
  updatedAt: string
}

export type QuizResult = 'correct' | 'wrong'

export interface QuizRecord {
  answer: string
  revealed: boolean
  result?: QuizResult
  updatedAt: string
}

export interface StudyPlan {
  examDate: string
  weeklyGoal: number
}

export interface StudyState {
  completedPoints: string[]
  marks: StudyMark[]
  quiz: Record<string, QuizRecord>
  plan: StudyPlan
  lastChapterId: string
  activity: Record<string, number>
}

export interface SourcePage {
  page: number
  text: string
  image: string
}

export interface SourceChapter {
  chapterId: string
  originalFile: string
  sourceType: string
  pageCount: number
  pages: SourcePage[]
}
