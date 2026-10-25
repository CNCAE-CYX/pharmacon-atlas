import { useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight,
  Circle, FileQuestion, History, ListChecks, RotateCcw, Sparkles, Target, X,
} from 'lucide-react'
import { getQuestionsForModule, modules } from '../data'
import { useStudy } from '../store/StudyContext'
import type { Question, QuizResult } from '../types'
import { cx, judgeFill, percent, questionTypeLabel } from '../utils'

type QuizFilter = 'all' | 'past' | 'supplement' | 'wrong'

interface PracticePageProps {
  moduleId: string
  onModuleChange: (moduleId: string) => void
  onChapter: (chapterId: string, pointId?: string) => void
}

export default function PracticePage({ moduleId, onModuleChange, onChapter }: PracticePageProps) {
  const module = modules.find((item) => item.id === moduleId) ?? modules[0]
  const moduleQuestions = getQuestionsForModule(module.id)
  const { state, setQuizRecord, resetModuleQuiz } = useStudy()
  const [filter, setFilter] = useState<QuizFilter>('all')
  const [currentId, setCurrentId] = useState(moduleQuestions[0]?.id ?? '')
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const filtered = useMemo(() => moduleQuestions.filter((question) => {
    if (filter === 'all') return true
    if (filter === 'wrong') return state.quiz[question.id]?.result === 'wrong'
    return question.origin === filter
  }), [moduleQuestions, filter, state.quiz])
  const activeId = filtered.some((question) => question.id === currentId) ? currentId : (filtered[0]?.id ?? '')
  const currentIndex = filtered.findIndex((question) => question.id === activeId)
  const current = filtered[currentIndex] ?? filtered[0]
  const input = current ? (drafts[current.id] ?? state.quiz[current.id]?.answer ?? '') : ''

  function setInput(value: string) {
    if (current) setDrafts((previous) => ({ ...previous, [current.id]: value }))
  }

  const answered = moduleQuestions.filter((question) => state.quiz[question.id]?.revealed).length
  const correct = moduleQuestions.filter((question) => state.quiz[question.id]?.result === 'correct').length
  const wrong = moduleQuestions.filter((question) => state.quiz[question.id]?.result === 'wrong').length

  function submit(question: Question) {
    if (!input.trim()) return
    if (question.type === 'choice') {
      setQuizRecord(question.id, { answer: input, revealed: true, result: input === question.answer ? 'correct' : 'wrong' })
    } else if (question.type === 'fill') {
      setQuizRecord(question.id, { answer: input, revealed: true, result: judgeFill(question, input) ? 'correct' : 'wrong' })
    } else {
      setQuizRecord(question.id, { answer: input, revealed: true })
    }
  }

  function assess(question: Question, result: QuizResult) {
    setQuizRecord(question.id, { result })
  }

  function retry(question: Question) {
    resetModuleQuiz([question.id])
    setInput('')
  }

  return (
    <div className="page practice-page">
      <header className="page-title-row practice-title">
        <div><span className="section-kicker">QUESTION LAB · 题库训练</span><h1>不是看懂了，<br />是能自己答出来。</h1><p>题型参照原卷：填空、名词解释、简答为主，另补充单选帮助快速自测。</p></div>
        <div className="origin-legend"><span className="past-badge"><History size={13} />往年真题 · 32</span><span className="supplement-badge"><Sparkles size={13} />Kimi 补充题 · 32</span></div>
      </header>

      <div className="quiz-module-tabs" role="tablist" aria-label="题库板块">
        {modules.map((item) => {
          const count = getQuestionsForModule(item.id).filter((question) => state.quiz[question.id]?.revealed).length
          return <button key={item.id} className={module.id === item.id ? 'active' : ''} onClick={() => { onModuleChange(item.id); setFilter('all'); setCurrentId('') }}><span>{String(item.order).padStart(2, '0')}</span>{item.shortTitle}<small>{count}/8</small></button>
        })}
      </div>

      <section className="quiz-module-summary">
        <div><span className={`module-pill tone-text-${module.tone}`}>板块 {String(module.order).padStart(2, '0')}</span><h2>{module.title}</h2><p>{module.subtitle}</p></div>
        <div className="quiz-summary-metrics"><span><strong>{answered}/8</strong>已作答</span><span><strong>{correct}</strong>答对</span><span><strong>{wrong}</strong>需复习</span></div>
        <div className="quiz-summary-progress"><span>{percent(answered, 8)}%</span><div><i style={{ width: `${percent(answered, 8)}%` }} /></div></div>
      </section>

      <div className="quiz-toolbar">
        <div>{(['all', 'past', 'supplement', 'wrong'] as QuizFilter[]).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{({ all: '全部题目', past: '只看真题', supplement: '只看补充', wrong: `错题复习${wrong ? ` (${wrong})` : ''}` })[item]}</button>)}</div>
        <button className="reset-quiz" onClick={() => { if (window.confirm(`确定重置「${module.title}」的 8 道答题记录吗？笔记与学习进度不会受影响。`)) resetModuleQuiz(moduleQuestions.map((question) => question.id)) }}><RotateCcw size={14} />重置本板块</button>
      </div>

      {current ? (
        <div className="quiz-layout">
          <section className="question-card">
            <header className="question-header">
              <div><span className="question-number">Q{String(currentIndex >= 0 ? currentIndex + 1 : 1).padStart(2, '0')}</span><span className="question-type">{questionTypeLabel(current.type)}</span></div>
              <span className={current.origin === 'past' ? 'past-badge' : 'supplement-badge'}>{current.origin === 'past' ? <History size={14} /> : <Sparkles size={14} />}{current.origin === 'past' ? '往年真题' : 'Kimi 补充题'}</span>
            </header>
            <div className="question-source"><BookOpen size={14} /><span>{current.source}</span></div>
            <h2 className="question-prompt">{current.prompt}</h2>

            <div className="answer-workspace">
              {current.type === 'choice' && (
                <div className="choice-list">
                  {current.options?.map((option) => {
                    const letter = option.trim().charAt(0)
                    const record = state.quiz[current.id]
                    const isCorrect = record?.revealed && letter === current.answer
                    const isWrongChoice = record?.revealed && letter === record.answer && letter !== current.answer
                    return <button key={option} disabled={record?.revealed} className={cx(record?.answer === letter && 'selected', isCorrect && 'correct', isWrongChoice && 'wrong')} onClick={() => setInput(letter)}><span>{letter}</span><p>{option.replace(/^[A-D][.、]\s*/, '')}</p>{isCorrect && <CheckCircle2 size={19} />}{isWrongChoice && <X size={19} />}</button>
                  })}
                </div>
              )}
              {current.type === 'fill' && <label className="answer-input"><span>在下方填写答案</span><input value={input} disabled={state.quiz[current.id]?.revealed} onChange={(event) => setInput(event.target.value)} placeholder="多个空可用分号隔开…" onKeyDown={(event) => { if (event.key === 'Enter') submit(current) }} /></label>}
              {(current.type === 'term' || current.type === 'short') && <label className="answer-input"><span>{current.type === 'term' ? '先用自己的话写出定义' : '先按要点组织答案，再对照评分点'}</span><textarea value={input} disabled={state.quiz[current.id]?.revealed} onChange={(event) => setInput(event.target.value)} rows={current.type === 'short' ? 7 : 4} placeholder="在这里作答，不必追求一字不差；重点关注机制链条是否完整…" /></label>}
            </div>

            {!state.quiz[current.id]?.revealed ? (
              <div className="question-actions"><span>{current.type === 'choice' ? '选择一个答案后提交' : current.type === 'fill' ? '系统按参考答案与关键词初判，也可自行校正' : '提交后显示参考答案与评分要点'}</span><button className="button primary" disabled={!input.trim()} onClick={() => submit(current)}>提交答案<ArrowRight size={16} /></button></div>
            ) : (
              <div className="answer-feedback">
                <div className="model-answer">
                  <span><ListChecks size={17} />参考答案</span>
                  <p>{current.answer}</p>
                  {current.rubric && <div className="answer-rubric"><strong>评分要点</strong>{current.rubric.map((item, index) => <em key={item}><span>{index + 1}</span>{item}</em>)}</div>}
                  {current.explanation && <div className="answer-explanation"><Target size={16} /><p>{current.explanation}</p></div>}
                </div>
                <div className="self-assessment">
                  <span>这题我答得怎么样？</span>
                  <div><button className={state.quiz[current.id]?.result === 'correct' ? 'assess-correct active' : 'assess-correct'} onClick={() => assess(current, 'correct')}><Check size={16} />我答对了</button><button className={state.quiz[current.id]?.result === 'wrong' ? 'assess-wrong active' : 'assess-wrong'} onClick={() => assess(current, 'wrong')}><X size={16} />需要复习</button></div>
                </div>
                <div className="feedback-links"><button onClick={() => onChapter(current.chapterId, current.pointId)}><BookOpen size={15} />回到对应知识点<ChevronRight size={15} /></button><button onClick={() => retry(current)}><RotateCcw size={14} />重新作答</button></div>
              </div>
            )}

            <footer className="question-pagination">
              <button disabled={currentIndex <= 0} onClick={() => setCurrentId(filtered[currentIndex - 1].id)}><ArrowLeft size={17} />上一题</button>
              <span>{currentIndex + 1} / {filtered.length}</span>
              <button disabled={currentIndex >= filtered.length - 1} onClick={() => setCurrentId(filtered[currentIndex + 1].id)}>下一题<ArrowRight size={17} /></button>
            </footer>
          </section>

          <aside className="answer-sheet">
            <span className="section-kicker">ANSWER SHEET</span><h3>本组答题卡</h3>
            <div className="answer-sheet-grid">
              {filtered.map((question, index) => {
                const record = state.quiz[question.id]
                return <button key={question.id} className={cx(current.id === question.id && 'current', record?.result === 'correct' && 'correct', record?.result === 'wrong' && 'wrong')} onClick={() => setCurrentId(question.id)}>{record?.result === 'correct' ? <Check size={15} /> : record?.result === 'wrong' ? <X size={15} /> : index + 1}<small>{question.origin === 'past' ? '真' : '补'}</small></button>
              })}
            </div>
            <div className="answer-sheet-legend"><span><i className="correct" />已掌握</span><span><i className="wrong" />需复习</span><span><Circle size={10} />未评价</span></div>
            <div className="answer-sheet-tip"><Sparkles size={17} /><p>名词解释和简答题采用“先作答 → 看评分点 → 自评”的方式，避免只看答案产生熟悉感错觉。</p></div>
          </aside>
        </div>
      ) : (
        <div className="empty-state quiz-empty"><FileQuestion size={32} /><h3>{filter === 'wrong' ? '这个筛选下还没有错题' : '没有匹配的题目'}</h3><p>{filter === 'wrong' ? '将题目标记为“需要复习”后，就会出现在这里。' : '切换其他筛选继续练习。'}</p><button className="button secondary" onClick={() => setFilter('all')}>查看全部题目</button></div>
      )}
    </div>
  )
}
