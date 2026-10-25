import type { Chapter, Module, Question } from '../types'
import m1 from './course-m1.json'
import m2 from './course-m2.json'
import m3 from './course-m3.json'
import m4 from './course-m4.json'
import m5 from './course-m5.json'
import m6 from './course-m6.json'
import m7 from './course-m7.json'
import m8 from './course-m8.json'
import q1 from './questions-m1.json'
import q2 from './questions-m2.json'
import q3 from './questions-m3.json'
import q4 from './questions-m4.json'
import q5 from './questions-m5.json'
import q6 from './questions-m6.json'
import q7 from './questions-m7.json'
import q8 from './questions-m8.json'

export const modules = [m1, m2, m3, m4, m5, m6, m7, m8] as Module[]
export const chapters: Chapter[] = modules.flatMap((module) => module.chapters)
export const questions: Question[] = [q1, q2, q3, q4, q5, q6, q7, q8].flat() as Question[]

export const chapterMap = new Map(chapters.map((chapter) => [chapter.id, chapter]))
export const pointMap = new Map(chapters.flatMap((chapter) => chapter.points.map((point) => [point.id, point])))
export const moduleMap = new Map(modules.map((module) => [module.id, module]))

export function getModuleForChapter(chapterId: string) {
  return modules.find((module) => module.chapters.some((chapter) => chapter.id === chapterId))
}

export function getChapterForPoint(pointId: string) {
  return chapters.find((chapter) => chapter.points.some((point) => point.id === pointId))
}

export function getQuestionsForModule(moduleId: string) {
  return questions.filter((question) => question.id.startsWith(`${moduleId}-`))
}

export function getQuestionsForChapter(chapterId: string) {
  return questions.filter((question) => question.chapterId === chapterId)
}

export const allPoints = chapters.flatMap((chapter) => chapter.points)
export const totalPoints = allPoints.length
export const totalQuestions = questions.length

export const courseStats = {
  modules: modules.length,
  chapters: chapters.length,
  points: totalPoints,
  questions: totalQuestions,
  sourcePages: 576,
}
